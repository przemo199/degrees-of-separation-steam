import {ReasonPhrases, StatusCodes} from "http-status-codes";
import {NextFunction, Request, Response} from "express";

function errorHandler(err: unknown, req: Request, res: Response, next: NextFunction) {
  if (err instanceof Error) {
    switch (err.message) {
      case ReasonPhrases.BAD_REQUEST:
        res.status(StatusCodes.BAD_REQUEST).send(ReasonPhrases.BAD_REQUEST);
        break;
      case ReasonPhrases.METHOD_NOT_ALLOWED:
        res.status(StatusCodes.METHOD_NOT_ALLOWED).send(ReasonPhrases.METHOD_NOT_ALLOWED);
        break;
    }
  } else {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(ReasonPhrases.INTERNAL_SERVER_ERROR);
  }
}

export {errorHandler};
