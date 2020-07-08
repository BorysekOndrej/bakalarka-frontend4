<template>
  <CDropdown
    inNav
    class="c-header-nav-items"
    placement="bottom-end"
    add-menu-classes="pt-0"
  >
    <template #toggler>
      <CHeaderNavLink>
        <div class="c-avatar">
          <CIcon
              :content="freeIcons.cilUser"
              class="c-avatar-img "
          />
          <!--

          <img
            src="img/avatars/6.jpg"
            class="c-avatar-img "
          >
                    -->

        </div>
      </CHeaderNavLink>
    </template>
    <CDropdownHeader tag="div" class="text-center" color="light">
      <strong>Account</strong>
    </CDropdownHeader>
    <CDropdownItem>
      <router-link class="routerLink" :to="{ name: 'Profile' }"> <CIcon name="cil-user" />Profile & Settings</router-link>
    </CDropdownItem>
    <CDropdownItem>
      <a href="#" v-on:click="logout" class="routerLink">
        <CIcon name="cil-lock-locked"/>Logout
      </a>
    </CDropdownItem>
  </CDropdown>
</template>

<script>
import {freeSet} from "@coreui/icons";

export default {
  name: 'TheHeaderDropdownAccnt',
  freeSet,
  data () {
    return { 
      itemsCount: 42
    }
  },
  methods: {
    logout(){
      console.debug("logout")
      this.$store.dispatch("logout");
      this.$router.push({ name: 'Login'})
    }
  },
  computed: {
    freeIcons(){
      return freeSet
    }
  }
}
</script>

<style scoped>
  .c-icon {
    margin-right: 0.3rem;
  }
  .routerLink {
    color: unset;
    text-underline: none;
  }
</style>