import express, { Application } from 'express';
import cors from 'cors';

function configApp(app: Application) {
    // Third-party middleware
    app.use(cors({
        origin: '*',
        methods: ['GET', 'POST', 'PATCH', 'DELETE']
    }));

    // Built-in middleware
    app.use(express.json());

    // Application-level middleware
}

export default configApp;