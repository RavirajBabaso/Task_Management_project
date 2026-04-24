#!/bin/bash

# Database backup script
# This script creates a compressed backup of the school_taskdb database

DB_NAME="school_taskdb"
DB_USER="your_db_user"
DB_PASS="your_db_password"
BACKUP_DIR="/var/backups/school-task"
DATE=$(date +%Y%m%d_%H%M%S)

# Create backup directory if it doesn't exist
mkdir -p $BACKUP_DIR

# Create backup
mysqldump -u$DB_USER -p$DB_PASS $DB_NAME | gzip > $BACKUP_DIR/backup_$DATE.sql.gz

echo "Backup completed: $BACKUP_DIR/backup_$DATE.sql.gz"

# Clean up old backups (keep last 7 days)
find $BACKUP_DIR -name "backup_*.sql.gz" -mtime +7 -delete

echo "Old backups cleaned up"