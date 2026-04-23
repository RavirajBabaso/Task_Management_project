"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.server = void 0;
const http_1 = __importDefault(require("http"));
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
const database_1 = require("./src/config/database");
const sockets_1 = require("./src/config/sockets");
const routes_1 = __importDefault(require("./src/routes"));
const app = (0, express_1.default)();
const server = http_1.default.createServer(app);
exports.server = server;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use('/api', routes_1.default);
const startServer = async () => {
    try {
        await database_1.sequelize.authenticate();
        console.log('Database connected');
        (0, sockets_1.initSocket)(server);
        server.listen(3000, () => {
            console.log('API server running on port 3000');
        });
    }
    catch (error) {
        console.error('Failed to start API server:', error);
        process.exit(1);
    }
};
if (require.main === module) {
    void startServer();
}
exports.default = app;
