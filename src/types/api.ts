// api/assets
interface Assets {
    textures: {
        blockTextures: Record<number, BlockTextures>;
        itemTextures: Record<number, BlockTextures>;
    };
    assets: {
        blocks: Record<number, BlockParams>;
        items: Record<number, Item>;
        recipes: Record<number, Recipe>;
        smelting: Record<number, SmeltingRecipe>;
    };
}

declare global {
    interface SuccessResponse<T> {
        ok: true;
        response: T;
    }
    interface ErrorResponse {
        ok: false;
        response: {
            exception: string;
            description: string;
        };
    }

    type ApiResponse<T> = SuccessResponse<T> | ErrorResponse;

    type AssetsResponse = ApiResponse<Assets>;
}
