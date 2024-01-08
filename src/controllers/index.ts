import express from 'express';
import {ItemsController} from "./items-controller";
import AuthMiddleware from "../middlewares/AuthMiddleware";

export class RootController {
    public readonly router = express.Router();

    constructor() {
        this.router.use('/items', new ItemsController().router)
    }
}