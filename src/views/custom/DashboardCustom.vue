<template>
  <div>
    <CCard>
      <CCardBody>
        <CRow>
          <CCol sm="5">
            <h4 class="card-title mb-0">Grade history</h4>
          </CCol>
        </CRow>
        <GradeHistoryGraphComponent style="height:300px;margin-top:40px;"/>
      </CCardBody>
    </CCard>
    <CRow>
      <CCol>
        <CCard>
          <CCardHeader>
            <h4 class="card-title mb-0">Current grades for active targets</h4>
          </CCardHeader>
          <CCardBody>
            <GradesDonutComponent></GradesDonutComponent>
          </CCardBody>
        </CCard>
      </CCol>
      <CCol>
        <CCard>
          <CCardHeader>
            <h4 class="card-title mb-0">Distribution of expirations for active targets</h4>
          </CCardHeader>
          <CCardBody>
            <ExpirationDonutComponent></ExpirationDonutComponent>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
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
