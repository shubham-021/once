import { ERROR_CODES, type ErrorCode, getErrorMessage } from "@once/shared";

export type ErrorLike = {
    code?: ErrorCode;
    message?: string;
    status?: number
}

type ActionContext =
  | "create-story"
  | "create-draft"
  | "continue-draft"
  | "revise-draft"
  | "save-edits"
  | "accept-draft"
  | "discard-draft"
  | "undo-scene"
  | "upvote"
  | "fork"
  | "note"
  | "auth-login"
  | "auth-signup"
  | "auth-otp"
  | "vault-create"
  | "vault-edit"
  | "vault-delete"
  | "library-delete"
  | "library-visibility"
  | "library-status"
  | "library-fork"
  | "generic";

const CONTEXT_MESSAGES: Record<ActionContext, Partial<Record<ErrorCode, string>>> = {
  "create-story": {
    INSUFFICIENT_BALANCE: "Not enough credits. Add credits to start a story.",
    VALIDATION_ERROR: "Some details are missing or invalid. Please review the form.",
  },
  "create-draft": {
    INSUFFICIENT_BALANCE: "Not enough credits to generate this draft.",
    LLM_ERROR: "The AI service didn't respond. Try again in a minute.",
  },
  "continue-draft": {
    INSUFFICIENT_BALANCE: "Not enough credits to continue.",
    RATE_LIMITED: "You're doing that too often. Please wait a moment.",
  },
  "revise-draft": {
    LLM_ERROR: "The AI service didn't respond. Try again in a minute.",
  },
  "save-edits": {},
  "accept-draft": {},
  "discard-draft": {},
  "undo-scene": {
    STORY_COMPLETED: "This story is completed and can't be changed.",
    NOT_OWNER: "You don't have permission to edit this story.",
  },
  "upvote": {},
  "fork": {
    NOT_FOUND: "This story could not be found.",
  },
  "note": {},
  "auth-login": {},
  "auth-signup": {},
  "auth-otp": {
    INVALID_OTP: "That OTP is incorrect. Try again.",
    EXPIRED_OTP: "That OTP expired. Request a new one.",
  },
  "vault-create": {
    VALIDATION_ERROR: "Please fill out the required fields.",
  },
  "vault-edit": {
    VALIDATION_ERROR: "Please fill out the required fields.",
  },
  "vault-delete": {},
  "library-delete": {},
  "library-visibility": {},
  "library-status": {},
  "library-fork": {},
  "generic": {},
};

export function getToastErrorMessage(error: ErrorLike | undefined, context: ActionContext = "generic") {
    if(!error?.code){
        return ERROR_CODES.UNKNOWN.message;
    }

    const override = CONTEXT_MESSAGES[context]?.[error.code];
    return override ?? getErrorMessage(error.code);
}

export function normalizeErrorCode(code?: string): ErrorCode | undefined {
  if (!code) return undefined;
  return code in ERROR_CODES ? (code as ErrorCode) : undefined;
}