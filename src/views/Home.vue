<template>
  <el-container>
    <el-header>
      PublicNetDisk
    </el-header>
    <el-main >
      <el-upload
          v-loading="state.loading"
          class="upload-file-class"
          drag
          action="/api/upload_file"
          :on-progress="uploadFileProgress"
          :on-success="uploadFileSuccess"
          :on-error="uploadFileError">
        <i class="el-icon-upload"></i>
        <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
      </el-upload>
      <el-table
        v-loading="state.loadingTable"
        :row-style="{height: '60px'}"
        @cell-mouse-enter="turnOnButton"
        @cell-mouse-leave="turnOffButton"
        empty-text="T_T"
        :data="state.filesShow.filter(data => !state.searchText || data.filename.toLowerCase().includes(state.searchText.toLowerCase()))"
        style="font-family: Consolas,serif; font-size: 17px"
        :default-sort="{prop: 'uploadTime', order: 'descending'}">
        <el-table-column
          :sort-method="sortFilename"
          sortable
          label="文件名"
          prop="filename"
          min-width="50%">
        </el-table-column>
        <el-table-column
            min-width="20%">
          <template #header>
            <el-input
              autofocus
              v-model="state.searchText"
              size="mini"
              placeholder="输入关键字搜索"/>
          </template>
          <template #default="scope">
            <a :href="'/api/download_file/' + scope.row.id" :download="scope.row.filename">
              <el-button
                v-if="scope.row.btnShow === true"
                @click="downloadFile(scope.row, scope)"
                type="success"
                icon="el-icon-download"
                circle
                size="mini">
              </el-button>
            </a>
            <text>&nbsp;</text>
            <el-button
              v-if="scope.row.btnShow === true"
              @click="deleteFile(scope.row)"
              type="danger"
              icon="el-icon-delete"
              circle
              size="mini">
            </el-button>
          </template>
        </el-table-column>
        <el-table-column
          sortable
          prop="uploadTime"
          label="上传时间"
          min-width="20%">
        </el-table-column>
        <el-table-column
          :sort-method="sortSize"
          sortable
          prop="size"
          label="文件大小"
          min-width="10%">
        </el-table-column>
      </el-table>
    </el-main>
    <el-footer style="text-align: center; font-family: Consolas, serif">
      Powered By ZlycerQan
    </el-footer>
  </el-container>

</template>

<script>
import {ElNotification} from 'element-plus'
import {reactive} from "vue";
import {getCurrentInstance} from "vue";
import {onMounted} from "vue";

export default {
  name: 'Home',
  setup() {
    const {proxy} = getCurrentInstance()
    let state = reactive({
      searchText: '',
      files: [
      ],
      filesShow: [
      ],
      loading: false,
      loadingTable: false
    })

    const loadData = () => {
      state.loadingTable = true
      proxy.$http.get('/get_file_list')
          .then((body) => {
            state.files = body.data["data"]
            state.filesShow = []
            let cur = 0;
            for (let i in state.files) {
              state.filesShow.push({
                id: state.files[i].id,
                filename: state.files[i].filename,
                uploadTime: formatTime(state.files[i].uploadTime),
                size: formatSize(state.files[i].size),
                btnShow: false,
                sourceSize: state.files[i].size,
                index: cur ++
              })
            }
            state.loadingTable = false
          })
    }

    onMounted(() => {
      loadData()
    })

    const uploadFileProgress = () => {
      state.loading = true
    }

    const uploadFileError = () => {
      state.loading = false
      ElNotification({
        type: 'error',
        message: 'Upload error.',
        position: 'bottom-right'
      })
    }

    const uploadFileSuccess = () => {
      state.loading = false
      ElNotification({
        type: 'success',
        message: 'Upload success.',
        position: 'bottom-right'
      })
      loadData()
    }

    const sortSize = (a, b) => {
      return a.sourceSize < b.sourceSize ? -1 : 1
    }

    const sortFilename = (a, b) => {
      return a.filename.toLowerCase() < b.filename.toLowerCase() ? -1 : 1
    }

    const formatTime = (time) => {
      return time.substring(0, 4) + '-'
          + time.substring(4, 6) + '-'
          + time.substring(6, 8) + ' '
          + time.substring(8, 10) + ':'
          + time.substring(10, 12) + ':'
          + time.substring(12, 14)
    }

    const formatSize = (size) => {
      if (size < 1024) {
        return size.toString() + 'B'
      }
      if (size < 1024 * 1024) {
        return  (size / 1024).toFixed(2).toString() + 'K'
      }
      if (size < 1024 * 1024 * 1024) {
        return (size / 1024 / 1024).toFixed(2).toString() + 'M'
      }
      return (size / 1024 / 1024 / 1024).toFixed(2).toString() + 'G'
    }

    const downloadFile = (row) => {
      ElNotification({
        message: 'Download ' + row.filename,
        position: 'bottom-right',
        type: 'success'
      })
    }

    const deleteFile = (row) => {
      proxy.$http.delete('/delete_file', {
        params: {
          id: row.id
        }
      }).then((body) => {
        if (body.data["code"] === 200) {
          ElNotification({
            message: 'Delete ' + row.filename,
            position: 'bottom-right',
            type: 'success'
          })
          loadData()
        } else {
          ElNotification({
            message: 'Delete ' + row.filename + " error.",
            position: 'bottom-right',
            type: 'error'
          })
        }
      }).catch(() => {
        ElNotification({
          message: 'Delete ' + row.filename + " error.",
          position: 'bottom-right',
          type: 'error'
        })
      })
    }

    const turnOnButton = (row) => {
      state.filesShow[row.index].btnShow = true
    }

    const turnOffButton = (row) => {
      state.filesShow[row.index].btnShow = false
    }

    return {
      state,
      turnOffButton,
      turnOnButton,
      downloadFile,
      deleteFile,
      sortSize,
      sortFilename,
      uploadFileProgress,
      uploadFileSuccess,
      uploadFileError
    }
  }
}
</script>

<style>
.el-header {
  background-color: #B3C0D1;
  color: #ffffff;
  font-family: Consolas, serif;
  font-size: 30px;
  text-align: center;
  line-height: 60px;
}
.upload-file-class {
  text-align: center;
  float: bottom;
}

</style>
