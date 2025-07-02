
#!/bin/bash
# LMS App Unified Automation Script
# Usage: ./scripts/lms-app.sh [setup|start|stop|init-db|status]
# Controls both backend (Spring Boot microservices) and frontend (React)

set -e

# Paths (relative to scripts/)
FRONTEND_DIR="../Frontend"
BACKEND_DIRS=("../Backend/api-gateway" "../Backend/book-service" "../Backend/eureka-server" "../Backend/fine-service" "../Backend/member-service" "../Backend/notification-service" "../Backend/transaction-service")
LOG_DIR="../Backend/logs"
SCRIPTS_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPTS_DIR/.." && pwd)"

# MySQL config for DB init (edit as needed)
MYSQL_USER="root"
MYSQL_PASS="root"
MYSQL_HOST="localhost"
MYSQL_PORT="3306"

function setup() {
    echo "[LMS] Setting up backend (Maven build)..."
    for dir in "${BACKEND_DIRS[@]}"; do
        (cd "$dir" && mvn clean install -DskipTests)
    done
    echo "[LMS] Setting up frontend (npm install)..."
    (cd "$FRONTEND_DIR" && npm install)
    echo "[LMS] Setup complete."
}

function start() {
    # Ensure log directory exists before starting any service
    if [ ! -d "$LOG_DIR" ]; then
        mkdir -p "$LOG_DIR"
    fi
    echo "[LMS] Starting backend services..."
    for dir in "${BACKEND_DIRS[@]}"; do
        svc=$(basename "$dir")
        # Ensure log file exists before redirecting output
        touch "$LOG_DIR/${svc}.log"
        (cd "$dir" && nohup mvn spring-boot:run > "$LOG_DIR/${svc}.log" 2>&1 &)
        echo "[LMS] Started $svc (log: $LOG_DIR/${svc}.log)"
        sleep 5
    done
    echo "[LMS] Starting frontend..."
    touch "$LOG_DIR/frontend.log"
    (cd "$FRONTEND_DIR" && nohup npm run dev > "$LOG_DIR/frontend.log" 2>&1 &)
    echo "[LMS] Started frontend (log: $LOG_DIR/frontend.log)"
}

function stop() {
    echo "[LMS] Stopping backend services..."
    pkill -f 'mvn spring-boot:run' || true
    echo "[LMS] Stopping frontend..."
    pkill -f 'npm run dev' || true
    echo "[LMS] All services stopped."
}

function status() {
    echo "[LMS] Service status:"
    for dir in "${BACKEND_DIRS[@]}"; do
        svc=$(basename "$dir")
        if pgrep -f "$dir.*mvn spring-boot:run" > /dev/null; then
            echo "  [UP]   $svc"
        else
            echo "  [DOWN] $svc"
        fi
    done
    if pgrep -f "$FRONTEND_DIR.*npm run dev" > /dev/null; then
        echo "  [UP]   frontend"
    else
        echo "  [DOWN] frontend"
    fi
}

function init_db() {
    echo "[LMS] Initializing MySQL databases..."
    mysql -u$MYSQL_USER -p$MYSQL_PASS < "$PROJECT_ROOT/scripts/01-create-databases.sql"
    mysql -u$MYSQL_USER -p$MYSQL_PASS < "$PROJECT_ROOT/scripts/02-seed-data.sql"
    echo "[LMS] Databases created and seeded."
}

case "$1" in
    setup)
        setup
        ;;
    start)
        start
        ;;
    stop)
        stop
        ;;
    status)
        status
        ;;
    init-db)
        init_db
        ;;
    *)
        echo "Usage: $0 {setup|start|stop|status|init-db}"
        exit 1
        ;;
esac
