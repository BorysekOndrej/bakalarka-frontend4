<template>
  <div>
    <GradesDonutComponent></GradesDonutComponent>
    <CCard>
      <CCardBody>
        <CRow>
          <CCol sm="5">
            <h4 id="traffic" class="card-title mb-0">Traffic</h4>
            <div class="small text-muted">November 2017</div>
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

export default {
  name: 'DashboardCustom',
  components: {
    GradeHistoryGraphComponent,
    GradesDonutComponent
  },
  data () {
    return {
    }
  },
  methods: {
  },

}
</script>
