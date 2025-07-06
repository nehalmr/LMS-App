
#!/usr/bin/env bash
# LMS App Unified Automation Script
# Usage: ./scripts/lms-app.sh [setup|start|stop|init-db|status]
# Controls both backend (Spring Boot microservices) and frontend (React)


# Exit on error, treat unset variables as error, and propagate errors in pipelines
set -euo pipefail


# Paths (relative to scripts/)
FRONTEND_DIR="../Frontend"
BACKEND_DIRS=("../Backend/api-gateway" "../Backend/book-service" "../Backend/eureka-server" "../Backend/fine-service" "../Backend/member-service" "../Backend/notification-service" "../Backend/transaction-service")
LOG_DIR="../Backend/logs"
SCRIPTS_DIR="$(cd "$(dirname "${BASH_SOURCE[0]:-$0}")" && pwd)"
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
        if [[ "$(uname)" == "Darwin" || "$(uname)" == "Linux" ]]; then
            (cd "$dir" && nohup mvn spring-boot:run > "$LOG_DIR/${svc}.log" 2>&1 &)
        else
            (cd "$dir" && mvn spring-boot:run > "$LOG_DIR/${svc}.log" 2>&1 &)
        fi
        echo "[LMS] Started $svc (log: $LOG_DIR/${svc}.log)"
        sleep 5
    done
    echo "[LMS] Starting frontend..."
    touch "$LOG_DIR/frontend.log"
    if [[ "$(uname)" == "Darwin" || "$(uname)" == "Linux" ]]; then
        (cd "$FRONTEND_DIR" && nohup npm run dev > "$LOG_DIR/frontend.log" 2>&1 &)
    else
        (cd "$FRONTEND_DIR" && npm run dev > "$LOG_DIR/frontend.log" 2>&1 &)
    fi
    echo "[LMS] Started frontend (log: $LOG_DIR/frontend.log)"
}

function stop() {
    echo "[LMS] Stopping backend services..."
    if [[ "$(uname)" == "Darwin" || "$(uname)" == "Linux" ]]; then
        pkill -f 'mvn spring-boot:run' || true
    else
        # Windows: Use taskkill if available
        if command -v taskkill >/dev/null 2>&1; then
            taskkill //IM java.exe //F 2>/dev/null || true
        fi
    fi
    echo "[LMS] Stopping frontend..."
    if [[ "$(uname)" == "Darwin" || "$(uname)" == "Linux" ]]; then
        pkill -f 'npm run dev' || true
    else
        if command -v taskkill >/dev/null 2>&1; then
            taskkill //IM node.exe //F 2>/dev/null || true
        fi
    fi
    echo "[LMS] All services stopped."
}

function status() {
    echo "[LMS] Service status:"
    for dir in "${BACKEND_DIRS[@]}"; do
        svc=$(basename "$dir")
        if [[ "$(uname)" == "Darwin" || "$(uname)" == "Linux" ]]; then
            if pgrep -f "$dir.*mvn spring-boot:run" > /dev/null; then
                echo "  [UP]   $svc"
            else
                echo "  [DOWN] $svc"
            fi
        else
            # Windows: Check for java.exe processes
            if tasklist 2>/dev/null | grep -iq java.exe; then
                echo "  [UP]   $svc (java.exe running)"
            else
                echo "  [DOWN] $svc (no java.exe)"
            fi
        fi
    done
    if [[ "$(uname)" == "Darwin" || "$(uname)" == "Linux" ]]; then
        if pgrep -f "$FRONTEND_DIR.*npm run dev" > /dev/null; then
            echo "  [UP]   frontend"
        else
            echo "  [DOWN] frontend"
        fi
    else
        if tasklist 2>/dev/null | grep -iq node.exe; then
            echo "  [UP]   frontend (node.exe running)"
        else
            echo "  [DOWN] frontend (no node.exe)"
        fi
    fi
}

function init_db() {
    echo "[LMS] Initializing MySQL databases..."
    if command -v mysql >/dev/null 2>&1; then
        mysql -u$MYSQL_USER -p$MYSQL_PASS < "$PROJECT_ROOT/scripts/01-create-databases.sql"
        mysql -u$MYSQL_USER -p$MYSQL_PASS < "$PROJECT_ROOT/scripts/02-seed-data.sql"
        echo "[LMS] Databases created and seeded."
    else
        echo "[ERROR] MySQL client not found. Please install MySQL client tools."
        exit 1
    fi
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
