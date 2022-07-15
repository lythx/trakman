interface CallParams {
    string?: string
    int?: number,
    double?: number,
    boolean?: boolean,
    struct?: {
        [key: string]: CallParams
    },
    base64?: string,
    array?: CallParams[]
}