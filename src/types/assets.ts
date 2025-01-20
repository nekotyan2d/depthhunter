declare global {
    type TexturePath = string;

    interface BlockTexturesAll {
        parent: "block/cube_all";
        textures: {
            all: TexturePath;
        };
    }

    interface BlockTexturesSided {
        parent: "block/cube";
        textures: {
            up: TexturePath;
            north: TexturePath;
            west: TexturePath;
            east: TexturePath;
            south: TexturePath;
        };
    }

    interface BlockTexturesColumn {
        parent: "block/cube_column";
        textures: {
            end: TexturePath;
            side: TexturePath;
        };
    }

    interface ItemsTextures {
        parent: "item/handheld";
        textures: {
            layer0: TexturePath;
        };
    }

    type BlockTextures = BlockTexturesAll | BlockTexturesSided | ItemsTextures | BlockTexturesColumn;

    interface BlockAssetsAll {
        parent: "block/cube_all";
        assets: {
            all: Blob;
        };
    }

    interface BlockAssetsSided {
        parent: "block/cube";
        assets: {
            up: Blob;
            north: Blob;
            west: Blob;
            east: Blob;
            south: Blob;
        };
    }

    interface BlockAssetsColumn {
        parent: "block/cube_column";
        assets: {
            end: Blob;
            side: Blob;
        };
    }

    interface ItemsAssets {
        parent: "item/handheld";
        assets: {
            layer0: Blob;
        };
    }

    type BlockAssets = BlockAssetsAll | BlockAssetsSided | ItemsAssets | BlockAssetsColumn;
}

