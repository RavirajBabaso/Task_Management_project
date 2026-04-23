"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middleware/auth.middleware");
const role_middleware_1 = require("../middleware/role.middleware");
const approvalController_1 = require("../controllers/approvalController");
const router = (0, express_1.Router)();
// POST /approvals - Create approval request (authenticated users)
router.post('/', auth_middleware_1.authenticateToken, approvalController_1.createApproval);
// GET /approvals - Get all approvals (Chairman only)
router.get('/', auth_middleware_1.authenticateToken, (0, role_middleware_1.requireRole)('CHAIRMAN'), approvalController_1.getAllApprovals);
// GET /approvals/my - Get user's own approvals (authenticated users)
router.get('/my', auth_middleware_1.authenticateToken, approvalController_1.getMyApprovals);
// PUT /approvals/:id - Process approval (Chairman only)
router.put('/:id', auth_middleware_1.authenticateToken, (0, role_middleware_1.requireRole)('CHAIRMAN'), approvalController_1.processApproval);
exports.default = router;
