<template>
    <div class="settings">
        <h2>Настройки</h2>
        <section>
            <h3>Прочее</h3>
            <Button @click="clearCache">
                <Icon icon="pixelarticons:reload" height="24" width="24"/>Сбросить кэш
            </Button>
            <Button @click="foundBug">
                <Icon icon="pixelarticons:bug" height="24" width="24"/>Нашел ошибку?
            </Button>
        </section>
        <!-- TODO добавить настройки -->
        <!-- <div>
            <label for="chunkBorders">Показывать границы чанков</label>
            <input id="chunkBorders" type="checkbox" v-model="showChunkBorders" />
        </div> -->
        <!-- <div>
            <label for="scaleSize">Изменять масштаб карты</label>
            <input id="scaleSize" type="checkbox" v-model="modifyScaleSize" />
        </div> -->
        <div class="extra-settings-trigger" @click="extraSettingsQuiz++"></div>
        <template v-if="extraSettingsQuiz >= 7">
            <section class="extra-settings">
                <h3>Дополнительные настройки</h3>
                <label for="backendUrl">URL бэкэнда</label>
                <div class="row">
                    <Input id="backendUrl" v-model="backendUrl" />
                    <Button @click="changeBackendUrl">
                        <Icon icon="pixelarticons:check" height="32px" width="32px" />
                    </Button>
                </div>
            </section>
        </template>
    </div>
</template>
<script lang="ts" setup>
import { ref, watch } from 'vue';
import { useGameStore } from '../stores/game';
import { useAssetsStore } from '../stores/assets';
import { storeToRefs } from 'pinia';
import Button from '../components/Button.vue';
import Input from '../components/Input.vue';
import { useAppStore } from '../stores/app';
import { Icon } from "@iconify/vue";

const app = useAppStore();
const game = useGameStore();
const { clearAssets } = useAssetsStore();

const { showChunkBorders, modifyScaleSize } = storeToRefs(game);
const backendUrl = ref(`${app.backendProtocol}//${app.backendHost}`);

watch([showChunkBorders, modifyScaleSize], () => {
    localStorage.setItem("settings", JSON.stringify({ showChunkBorders: showChunkBorders.value, modifyScaleSize: modifyScaleSize.value }));
})

const extraSettingsQuiz = ref(0);

async function clearCache() {
    await clearAssets();
    window.location.reload();
}

function foundBug() {
    window.Telegram.WebApp.openLink("https://github.com/nekotyan2d/depthhunter/issues/new?template=Blank+issue");
}

function changeBackendUrl(){
    localStorage.setItem("settings", JSON.stringify({ backendUrl: backendUrl.value, ...JSON.parse(localStorage.getItem("settings") || "{}") }));
    window.location.reload();
}
</script>
<style lang="scss" scoped>
.settings {
    padding: 16px;

    .extra-settings-trigger {
        height: 50px;
    }

    section {
        display: flex;
        flex-direction: column;
        gap: 8px;
        padding: 8px;

        button {
            display: flex;
            align-items: center;
            gap: 8px;
            width: fit-content;
        }
        label {
            display: block;
        }

        .row {
            display: flex;
            align-items: center;

            input {
                flex: 1;
            }

            button {
                display: flex;
                align-items: center;
                justify-content: center;
            }
        }
    }
}
</style>