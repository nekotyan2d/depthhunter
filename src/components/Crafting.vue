<template>
    <div class="crafting">
        <div class="title">Крафты</div>
        <div v-if="selectedRecipe != null" class="crafting-table">
            <div class="ingredients">
                <Slot 
                    v-for="ingredient in sortedRecipes[selectedRecipe].ingredients" 
                    :slot="ingredient"
                    class="ingredient" :class="{disabled: !canBeCrafted(selectedRecipe)}" :selected="false"/>
            </div>
            <Icon class="arrow" icon="pixelarticons:arrow-right" height="30px" width="30px"/>
            <Slot class="result" :slot="recipes[selectedRecipe].result"/>
            <Button :disabled="!canBeCrafted(selectedRecipe)" @click="game.craftItem(selectedRecipe)">Создать</Button>
        </div>
        <div class="recipes">
            <Slot v-for="(recipe, id) in sortedRecipes" :slot="recipe.result" class="recipe" :class="{selected: selectedRecipe == +id, disabled: !canBeCrafted(+id)}" @click="selectedRecipe = +id"/>
        </div>
    </div>
</template>
<script setup lang="ts">
import { computed, ref } from 'vue';
import { storeToRefs } from 'pinia';
import { useAssetsStore } from '../stores/assets';
import Button from './Button.vue';
import Slot from './Slot.vue';
import { Icon } from "@iconify/vue";
import { useGameStore } from '../stores/game';

const assets = useAssetsStore();
const game = useGameStore();

const { recipes } = storeToRefs(assets);
const { inventory, hand, usingCraftingTable } = storeToRefs(game);

const sortedRecipes = computed(() => {
    const sorted = Object.entries(recipes.value).filter(([, recipe]) => usingCraftingTable.value ? true : !recipe.craftingTable);
    return Object.fromEntries(sorted);
});

function canBeCrafted(id: number): boolean {
    const recipe = recipes.value[id];
    if (!recipe) return false;

    for (const ingredient of recipe.ingredients) {
        if ([...inventory.value, hand.value].filter(i => i && i.id === ingredient.id).reduce((count, slot) => count + slot!.count, 0) < ingredient.count) {
            return false;
        }
    }

    return true;
};

const selectedRecipe = ref<number | null>(null);
</script>
<style lang="scss" scoped>
.crafting {
    width: 100%;

    .title{
        font-size: 1.1rem;
    }

    .crafting-table {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        height: fit-content;
        margin-bottom: 8px;

        img {
            width: 40px;
            height: 40px;
        }

        .ingredients {
            display: flex;
            flex-wrap: wrap;
            flex: 1;
            min-height: 40px;
            background-color: var(--color-bg-secondary);
        }

        .ingredient{
            height: 40px;
            width: 40px;
            position: relative;
            display: flex;
            align-items: center;
            justify-content: center;

            img {
                width: 80%;
                height: 80%;
            }

            .count {
                position: absolute;
                right: 0;
                bottom: 0;
            }
        }

        .arrow {
            color: var(--color-hint);
        }

        .result {
            height: 40px;
            width: 40px;
            background-color: var(--color-bg-secondary);
        }
    }

    .recipes {
        display: grid;
        grid-template-columns: repeat(9, 1fr);
        grid-template-rows: repeat(auto, 1fr);
        width: 100%;
    }

    .recipe, .ingredient {
        &.disabled {
            filter: grayscale(100%);
        }
    }
}
</style>