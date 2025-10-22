import { Router } from "express";
import { UserRouter } from "../modules/user/user.routes";




const router = Router();


const moduleRoutes = [
    {
        path: '/user',
        route: UserRouter
    }
];

moduleRoutes.forEach((item) => {
    router.use(item.path, item.route);
});

export default router;