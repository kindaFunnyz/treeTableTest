import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import {
  ModuleRegistry,
  AllCommunityModule, // or AllEnterpriseModule
} from 'ag-grid-community'
import { TreeDataModule } from 'ag-grid-enterprise'
ModuleRegistry.registerModules([
  AllCommunityModule, // or AllEnterpriseModule
  TreeDataModule,
])

const app = createApp(App)
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

app.use(createPinia())
app.use(router)
app.use(ElementPlus)

app.mount('#app')
