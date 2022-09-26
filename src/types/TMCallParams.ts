export interface TMCallParams {
  string?: string
  int?: number,
  double?: number,
  boolean?: boolean,
  struct?: {
    [key: string]: TM.CallParams
  },
  base64?: string,
  array?: TM.CallParams[]
}