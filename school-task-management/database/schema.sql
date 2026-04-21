CREATE DATABASE IF NOT EXISTS school_taskdb CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE school_taskdb;

CREATE TABLE departments (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  name VARCHAR(150) NOT NULL,
  head_user_id INT UNSIGNED NULL,
  description TEXT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_departments_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE users (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  name VARCHAR(150) NOT NULL,
  email VARCHAR(191) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('CHAIRMAN','DIRECTOR','PROPERTY','FINANCE','ADMIN','PRINCIPAL','ADMISSION','HR','PURCHASE','IT','TRANSPORT') NOT NULL,
  department_id INT UNSIGNED NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  last_login DATETIME NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_users_email (email),
  KEY idx_users_department_id (department_id),
  CONSTRAINT fk_users_department_id FOREIGN KEY (department_id) REFERENCES departments (id)
    ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

ALTER TABLE departments
  ADD CONSTRAINT fk_departments_head_user_id FOREIGN KEY (head_user_id) REFERENCES users (id)
    ON UPDATE CASCADE ON DELETE SET NULL;

CREATE TABLE tasks (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  title VARCHAR(255) NOT NULL,
  description TEXT NULL,
  assigned_by INT UNSIGNED NOT NULL,
  assigned_to INT UNSIGNED NOT NULL,
  department_id INT UNSIGNED NULL,
  priority ENUM('HIGH','MEDIUM','LOW') NOT NULL,
  status ENUM('PENDING','IN_PROGRESS','COMPLETED','DELAYED','ESCALATED') NOT NULL,
  start_date DATETIME NOT NULL,
  due_date DATETIME NOT NULL,
  attachment_path VARCHAR(500) NULL,
  completed_at DATETIME NULL,
  PRIMARY KEY (id),
  KEY idx_tasks_assigned_by (assigned_by),
  KEY idx_tasks_assigned_to (assigned_to),
  KEY idx_tasks_department_id (department_id),
  CONSTRAINT fk_tasks_assigned_by FOREIGN KEY (assigned_by) REFERENCES users (id)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_tasks_assigned_to FOREIGN KEY (assigned_to) REFERENCES users (id)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_tasks_department_id FOREIGN KEY (department_id) REFERENCES departments (id)
    ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE task_histories (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  task_id INT UNSIGNED NOT NULL,
  updated_by INT UNSIGNED NOT NULL,
  old_status ENUM('PENDING','IN_PROGRESS','COMPLETED','DELAYED','ESCALATED') NULL,
  new_status ENUM('PENDING','IN_PROGRESS','COMPLETED','DELAYED','ESCALATED') NOT NULL,
  comment TEXT NULL,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_task_histories_task_id (task_id),
  KEY idx_task_histories_updated_by (updated_by),
  CONSTRAINT fk_task_histories_task_id FOREIGN KEY (task_id) REFERENCES tasks (id)
    ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_task_histories_updated_by FOREIGN KEY (updated_by) REFERENCES users (id)
    ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE notifications (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id INT UNSIGNED NOT NULL,
  type ENUM('TASK_ASSIGNED','TASK_UPDATED','TASK_DELAYED','TASK_ESCALATED','ANNOUNCEMENT') NOT NULL,
  message TEXT NOT NULL,
  task_id INT UNSIGNED NULL,
  is_read TINYINT(1) NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_notifications_user_id (user_id),
  KEY idx_notifications_task_id (task_id),
  CONSTRAINT fk_notifications_user_id FOREIGN KEY (user_id) REFERENCES users (id)
    ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_notifications_task_id FOREIGN KEY (task_id) REFERENCES tasks (id)
    ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE approvals (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  type ENUM('BUDGET','PURCHASE','POLICY','EVENT') NOT NULL,
  requested_by INT UNSIGNED NOT NULL,
  approved_by INT UNSIGNED NULL,
  status ENUM('PENDING','APPROVED','REJECTED') NOT NULL,
  title VARCHAR(255) NOT NULL,
  details TEXT NULL,
  amount DECIMAL(12,2) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_approvals_requested_by (requested_by),
  KEY idx_approvals_approved_by (approved_by),
  CONSTRAINT fk_approvals_requested_by FOREIGN KEY (requested_by) REFERENCES users (id)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_approvals_approved_by FOREIGN KEY (approved_by) REFERENCES users (id)
    ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE announcements (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  created_by INT UNSIGNED NOT NULL,
  target ENUM('ALL','DEPARTMENT') NOT NULL,
  message TEXT NOT NULL,
  department_id INT UNSIGNED NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_announcements_created_by (created_by),
  KEY idx_announcements_department_id (department_id),
  CONSTRAINT fk_announcements_created_by FOREIGN KEY (created_by) REFERENCES users (id)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_announcements_department_id FOREIGN KEY (department_id) REFERENCES departments (id)
    ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE reports (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  type ENUM('DAILY','WEEKLY','MONTHLY') NOT NULL,
  generated_by INT UNSIGNED NOT NULL,
  file_path VARCHAR(500) NOT NULL,
  department_id INT UNSIGNED NULL,
  date_from DATETIME NOT NULL,
  date_to DATETIME NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_reports_generated_by (generated_by),
  KEY idx_reports_department_id (department_id),
  CONSTRAINT fk_reports_generated_by FOREIGN KEY (generated_by) REFERENCES users (id)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_reports_department_id FOREIGN KEY (department_id) REFERENCES departments (id)
    ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
