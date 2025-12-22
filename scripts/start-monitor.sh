#!/bin/bash
# Start Results Monitor Script
#
# Usage:
#   ./start-monitor.sh         # Run once
#   ./start-monitor.sh daemon  # Run in background every 5 minutes
#   ./start-monitor.sh stop    # Stop background daemon

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PID_FILE="/tmp/lottery-results-monitor.pid"
LOG_FILE="/tmp/lottery-results-monitor.log"

cd "$SCRIPT_DIR"

case "$1" in
  daemon)
    if [ -f "$PID_FILE" ] && kill -0 $(cat "$PID_FILE") 2>/dev/null; then
      echo "Monitor is already running (PID: $(cat $PID_FILE))"
      exit 1
    fi

    echo "Starting Results Monitor daemon..."
    nohup node results-monitor.js --daemon >> "$LOG_FILE" 2>&1 &
    echo $! > "$PID_FILE"
    echo "Monitor started with PID: $(cat $PID_FILE)"
    echo "Logs: $LOG_FILE"
    ;;

  stop)
    if [ -f "$PID_FILE" ]; then
      PID=$(cat "$PID_FILE")
      if kill -0 $PID 2>/dev/null; then
        echo "Stopping monitor (PID: $PID)..."
        kill $PID
        rm -f "$PID_FILE"
        echo "Monitor stopped."
      else
        echo "Monitor not running (stale PID file)."
        rm -f "$PID_FILE"
      fi
    else
      echo "Monitor not running."
    fi
    ;;

  status)
    if [ -f "$PID_FILE" ] && kill -0 $(cat "$PID_FILE") 2>/dev/null; then
      echo "Monitor is running (PID: $(cat $PID_FILE))"
      echo "Last 10 log lines:"
      tail -10 "$LOG_FILE"
    else
      echo "Monitor is not running."
    fi
    ;;

  logs)
    if [ -f "$LOG_FILE" ]; then
      tail -f "$LOG_FILE"
    else
      echo "No log file found."
    fi
    ;;

  *)
    echo "Running single sync..."
    node results-monitor.js
    ;;
esac
