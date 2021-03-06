export type Role = "BTC" | "STAKER" | "LIQUIDITY" | "TOKEN_HOLDER"

export const NEXT = "NEXT"

export type Result = Role | typeof NEXT

export interface QuizOption {
  label: string
  result: Result
}

export interface QuizStageData {
  stageId: Role
  title: string
  options: QuizOption[]
  includeAccordion: boolean
}

export interface GoForward {
  (result: Result): void
}

export interface GoBack {
  (): void
}
