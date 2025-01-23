<template>
    <div class="smelting">
        <div class="title">Печь</div>
        <div v-if="selectedRecipe != null" class="furnace">
            <div class="ingredients">
                <Slot
                    :slot="{id: smeltingRecipes[selectedRecipe].input, count: 1}"
                    class="ingredient" :class="{disabled: !canBeSmelted(selectedRecipe)}"/>
                <Slot
                    :slot="{id: 2, count: smeltingRecipes[selectedRecipe].fuelCount}"
                    class="ingredient" :class="{disabled: !canBeSmelted(selectedRecipe)}"/>
            </div>
            <Icon class="arrow" icon="pixelarticons:arrow-right" height="30px" width="30px"/>
            <Slot class="result" :slot="{id: smeltingRecipes[selectedRecipe].output, count: 1}"/>
            <Button :disabled="!canBeSmelted(selectedRecipe)" @click="game.smeltItem(selectedRecipe)">Переплавить</Button>
        </div>
        <div class="recipes">
            <Slot v-for="(recipe, id) in smeltingRecipes" :slot="{id: recipe.output, count: 1}" class="recipe" :class="{selected: selectedRecipe == +id, disabled: !canBeSmelted(+id)}" @click="selectedRecipe = +id"/>
        </div>
    </div>
</template>
<script lang="ts" setup>
import { ref } from "vue";

import { storeToRefs } from "pinia";

import { useAssetsStore } from "../stores/assets";
import { useGameStore } from "../stores/game";

import Slot from "./Slot.vue";
import { Icon } from "@iconify/vue";
import Button from "./Button.vue";

const assets = useAssetsStore();
const game = useGameStore();

const { smeltingRecipes } = storeToRefs(assets);
const { inventory, hand } = storeToRefs(game);

function canBeSmelted(id: number): boolean {
    const recipe = smeltingRecipes.value[id];
    if (!recipe) return false;

    if ([...inventory.value, hand.value].filter(i => i && i.id === recipe.input).reduce((count, slot) => count + slot!.count, 0) < 1){
        return false;
    }

    if ([...inventory.value, hand.value].filter(i => i && i.id === 2).reduce((count, slot) => count + slot!.count, 0) < recipe.fuelCount){
        return false;
    }

    return true;
};

const selectedRecipe = ref<number | null>(null);
</script>
<style lang="scss" scoped>
@use "../assets/scss/recipes" as *;
</style>