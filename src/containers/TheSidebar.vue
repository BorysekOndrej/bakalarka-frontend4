<template>
  <CSidebar 
    fixed 
    :minimize="minimize"
    :show="show"
    @update:show="(value) => $store.commit('set', ['sidebarShow', value])"
  >
    <CSidebarBrand class="d-md-down-none" to="/">
      <CIcon 
        :content="icon_security"
        size="custom-size" 
        :height="35" 
      />
      <h2
              v-if="!minimize"
              style="white-space: nowrap; overflow: hidden;"
      >TLS Inventory</h2>
    </CSidebarBrand>

    <CRenderFunction flat :content-to-render="$options.nav"/>
    <CSidebarMinimizer
      class="d-md-down-none"
      @click.native="$store.commit('set', ['sidebarMinimize', !minimize])"
    />
  </CSidebar>
</template>

<script>
import nav from './_nav'

export default {
  name: 'TheSidebar',
  nav,
  computed: {
    show () {
      return this.$store.state.sidebarShow 
    },
    minimize () {
      return this.$store.state.sidebarMinimize 
    },
    icon_security(){
      // Icon Security by Adrien Coquet from the Noun Project at https://thenounproject.com/icon/2631109/
      return '<svg xmlns:x="http://ns.adobe.com/Extensibility/1.0/" xmlns:i="http://ns.adobe.com/AdobeIllustrator/10.0/" xmlns:graph="http://ns.adobe.com/Graphs/1.0/" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" x="0px" y="0px" viewBox="0 0 100 125" style="enable-background:new 0 0 100 100;" xml:space="preserve"><switch><foreignObject requiredExtensions="http://ns.adobe.com/AdobeIllustrator/10.0/" x="0" y="0" width="1" height="1"/><g i:extraneous="self"><g><path d="M5273.1,2400.1v-2c0-2.8-5-4-9.7-4s-9.7,1.3-9.7,4v2c0,1.8,0.7,3.6,2,4.9l5,4.9c0.3,0.3,0.4,0.6,0.4,1v6.4     c0,0.4,0.2,0.7,0.6,0.8l2.9,0.9c0.5,0.1,1-0.2,1-0.8v-7.2c0-0.4,0.2-0.7,0.4-1l5.1-5C5272.4,2403.7,5273.1,2401.9,5273.1,2400.1z      M5263.4,2400c-4.8,0-7.4-1.3-7.5-1.8v0c0.1-0.5,2.7-1.8,7.5-1.8c4.8,0,7.3,1.3,7.5,1.8C5270.7,2398.7,5268.2,2400,5263.4,2400z"/><path d="M5268.4,2410.3c-0.6,0-1,0.4-1,1c0,0.6,0.4,1,1,1h4.3c0.6,0,1-0.4,1-1c0-0.6-0.4-1-1-1H5268.4z"/><path d="M5272.7,2413.7h-4.3c-0.6,0-1,0.4-1,1c0,0.6,0.4,1,1,1h4.3c0.6,0,1-0.4,1-1C5273.7,2414.1,5273.3,2413.7,5272.7,2413.7z"/><path d="M5272.7,2417h-4.3c-0.6,0-1,0.4-1,1c0,0.6,0.4,1,1,1h4.3c0.6,0,1-0.4,1-1C5273.7,2417.5,5273.3,2417,5272.7,2417z"/></g><g><path d="M70.2,63c0,0.5,0,1,0,1.6c0,2.5-0.4,4.8-1,7H56.6c0.2-2.3,0.3-4.6,0.3-7V63h-0.3c-2,0-4-0.5-5.7-1.3     c0.1,0.9,0.1,1.9,0.1,2.9c0,2.5-0.1,4.8-0.3,7H36c-0.2-2.2-0.3-4.5-0.3-7c0-2.5,0.1-4.8,0.3-7h10.2c-1.2-1.7-2-3.7-2.3-5.9h-7.1     c1.6-8.9,4.6-14,6.5-14c0.2,0,0.3,0,0.5,0.1v-6.1h-0.5c-18.1,0-32.9,14.7-32.9,32.8c0,18.1,14.8,32.9,32.9,32.9     s32.8-14.8,32.8-32.9c0-0.5,0-1.1-0.1-1.6H70.2z M16.4,64.6c0-2.4,0.4-4.7,1-7H30c-0.2,2.3-0.3,4.7-0.3,7c0,2.4,0.1,4.7,0.3,7     H17.4C16.8,69.4,16.4,67.1,16.4,64.6z M19.8,77.6h11c0.7,4.7,2,9.1,3.6,12.5C28.1,87.8,22.9,83.3,19.8,77.6z M30.8,51.7h-11     c3.2-5.8,8.4-10.3,14.7-12.5C32.7,42.7,31.6,47,30.8,51.7z M43.3,91.6c-1.9,0-4.9-5.2-6.5-14h13.1C48.3,86.4,45.2,91.6,43.3,91.6     z M52.2,90c1.7-3.4,2.9-7.7,3.6-12.5h11C63.7,83.3,58.5,87.8,52.2,90z"/><path d="M84.1,21.7v-4.2c0-8.2-6.7-14.9-14.9-14.9S54.2,9.2,54.2,17.4v4.2c-3.1,1-5.4,3.9-5.4,7.4v21.3c0,4.3,3.5,7.8,7.8,7.8     h25.2c4.3,0,7.8-3.5,7.8-7.8V29.1C89.5,25.6,87.2,22.7,84.1,21.7z M60.1,17.4c0-5,4.1-9,9-9c5,0,9,4.1,9,9v3.8H60.1V17.4z      M83.6,50.3c0,1-0.8,1.9-1.9,1.9H56.6c-1,0-1.9-0.8-1.9-1.9V29.1c0-1,0.8-1.9,1.9-1.9h25.2c1,0,1.9,0.8,1.9,1.9V50.3z"/><path d="M74,33.4l-6.4,6.4l-3.2-3.2c-1.2-1.2-3-1.2-4.2,0c-1.2,1.2-1.2,3,0,4.2l5.3,5.3c0.6,0.6,1.3,0.9,2.1,0.9s1.5-0.3,2.1-0.9     l8.4-8.4c1.2-1.2,1.2-3,0-4.2S75.1,32.2,74,33.4z"/></g></g></switch></svg>';
    },
  }
}
</script>
