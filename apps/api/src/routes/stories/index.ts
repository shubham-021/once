import { Hono } from "hono";
import crudRouter from "./crud";
import scenesRouter from "./scenes";
import continueRouter from "./continue";
import forkRouter from "./fork";
import deferredRouter from "./deferred";
import protagonistsRouter from "./protagonists";
import social from "./social";
import analyticsRouter from "./analytics";
import draftsRouter from "./drafts";
import options from "./options";

const storiesRouter = new Hono();

storiesRouter.route("/", analyticsRouter);
storiesRouter.route("/", crudRouter);
storiesRouter.route("/", scenesRouter);
storiesRouter.route("/", continueRouter);
storiesRouter.route("/", forkRouter);
storiesRouter.route("/", deferredRouter);
storiesRouter.route("/", social);
storiesRouter.route("/", protagonistsRouter);
storiesRouter.route("/", draftsRouter);
storiesRouter.route("/options", options);

export default storiesRouter;
