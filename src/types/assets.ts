declare global {
    interface BlockAssetSides {
        main: Blob;
        top?: Blob;
        left?: Blob;
        right?: Blob;
        front?: Blob;
        back?: Blob;
    }
}

