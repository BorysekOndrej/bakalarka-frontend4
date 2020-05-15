<template>
  <div>
    <CRow>
      <CCol>
        <GradesDonutComponent></GradesDonutComponent>
      </CCol>
      <CCol>
        <ExpirationDonutComponent></ExpirationDonutComponent>
      </CCol>
    </CRow>
    <CCard>
      <CCardBody>
        <CRow>
          <CCol sm="5">
            <h4 id="traffic" class="card-title mb-0">Grade history</h4>
          </CCol>
        </CRow>
        <GradeHistoryGraphComponent style="height:300px;margin-top:40px;"/>
      </CCardBody>

    </CCard>
  </div>
</template>

<script>
import GradeHistoryGraphComponent from './GradeHistoryGraphComponent'
import GradesDonutComponent from "./GradesDonutComponent";
import ExpirationDonutComponent from "./ExpirationDonutComponent";

export default {
  name: 'DashboardCustom',
  components: {
    GradeHistoryGraphComponent,
    GradesDonutComponent,
    ExpirationDonutComponent
  },
  data () {
    return {
    }
  },
  methods: {
  },

}
</script>
