import React, { Component } from 'react';
import { StyleSheet, Text, View, Button, TouchableOpacity, ScrollView, TextInput, Modal, Alert, Keyboard, StatusBar, Platform, SectionList} from 'react-native';

import { MaterialIcons, MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { Spinner } from 'native-base';

import DropdownAlert from 'react-native-dropdownalert';

import { isIphoneXorAbove } from "../../filters";

import axios from "../../axios"
import { connect } from 'react-redux';
import { findIndex, forEach, chain, groupBy, map, filter, isEmpty } from 'lodash'
import { Audio } from 'expo';
import Loader from '../Helper/Loader';

import { checkColor, checkTypePackage, playSoundSuccess, playSoundFail } from "../Helper/Funtions"

class SectionListItem extends Component {
  constructor(props) {
    super(props)
    this.state = {
      checked: false,
      hide: 0,
      random: 0,
    }
  }
  // Initialize the states
  componentWillMount() {
    const { checked, hide, random } = this.props.item
    this.setState({ checked, hide, random })
  }
  componentWillReceiveProps(nextProps) {
    const { checked, hide, random } = nextProps.item
    this.setState({ checked, hide, random })
  }
  shouldComponentUpdate(nextProps, nextState) {
    // console.log('==========STATE=============');
    // console.log(this.state);
    // console.log('==========NEXT STATE=============');
    // console.log(nextState);
    const { checked, hide, random } = nextState
    const { checked: oldChecked, hide: oldHide, random: oldRandom } = this.state
    // console.log(checked !== oldChecked || hide !== oldHide);
    return checked !== oldChecked || hide !== oldHide || random != oldRandom;
  }
  render() {
    const item = this.props.item
    if (!item.hide) {
      return (
        <TouchableOpacity key={ item.barcode } onPress={ this.props.onPress }>
          <View style={{ height: 70, borderBottomWidth: 1, borderColor: '#F3F3F3', display: 'flex', flexDirection: 'row', alignItems:'center', marginRight: 10, marginLeft: 10, justifyContent: 'space-between' }}>

            <View style={{ display: 'flex', flexDirection: 'row', alignItems:'center', flex: 60 }}>
              {
                (item.checked > 0 || item.checked) ?
                  <MaterialCommunityIcons name='check-circle' size={ 22 } color='#000' style={{ marginRight: 5 }} />
                :
                <MaterialCommunityIcons name='checkbox-blank-circle-outline' size={ 22 } color='#000' style={{ marginRight: 5 }} />
              }
              <View style={{ display: 'flex', flexDirection: 'column', marginLeft: 5 }}>
                <Text style={{ fontSize: 14, fontWeight: 'bold' }}>{ item.barcode }</Text>
                <Text style={{ marginTop: 4, fontSize: 13, color: '#4a4a4a' }}>{ item.product_name } - { item.product_weight } kg</Text>
              </View>
            </View>

            <View style={{ flex: 40, alignItems: 'flex-end', flexDirection: 'column' }}>
              <Text style={{ fontSize: 12 }}>{ item.time_wait }</Text>
              <MaterialCommunityIcons style={{ marginTop: 8, color: item.color_app }} name='checkbox-blank-circle' size={ 14 } />
            </View>

          </View>
        </TouchableOpacity>
      )
    } else {
      return null
    }

  }
}

class SectionHeader extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: []
    }
    this.doWork = this.doWork.bind();
  }
  doWork (data) {
    let flag = false; // Toàn bộ hide = 1
    forEach(data, (item, index) => {
      // Có 1 cái hide = 0 thì
      if (!item.hide) {
        flag = true
      }

    })
    return flag ? true : false;
  }
  render() {
    return (
      <View>
        {
          this.doWork(this.props.section.data) &&
          <View style={{ backgroundColor: '#e5e5e5', paddingLeft: 10, height: 30, alignItems: 'center', flexDirection: 'row' }}>
            <MaterialCommunityIcons name='map-marker-radius' size={ 20 } color='#000' />
            <Text style={{ fontSize: 13, paddingLeft: 8, fontWeight: 'bold' }}>
              { this.props.section.department_to }
            </Text>
          </View>
        }
      </View>

    );
  }
}

class F3GroupScreen extends Component {

  constructor(props) {
    super(props);
    this.isCancelled = false;
    this.state = {
      loading: true,
      refreshing: false,
      loadingModal: false,
      listPackage: [],
      countText: 0,
      scanBarcodeStatus: 1,
      showCancel: 0,
      showAction: 0,
      toDepartment: {}
    };
    this.audioPlayer = new Audio.Sound();
    this.onPressSectionListItem = this.onPressSectionListItem.bind()
    this.handleRefresh = this.handleRefresh.bind()
  }

  componentDidMount() {
    this.isCancelled = false;
    this.didFocusListener = this.props.navigation.addListener(
      'didFocus',
      () => {
        this.clickStartScanBarcode();
        const { params } = this.props.navigation.state
        if (params && params.toDepartment) {
          this.setState({
            ...this.state, toDepartment: params.toDepartment
          });
        }
      }
    );
    this.fetchLocalF2GetListPackageToGroup(false);
  }
  componentWillUnmount() {
    this.isCancelled = true;
    this.didFocusListener.remove();
  }
  fetchLocalF2GetListPackageToGroup (loading = false) {
    if (loading) {
      this.setState({
        ...this.state, loading: true
      });
    }

    let data = {
      "department_id": this.props.accountState.workDepartment.department_id
    }

    axios.post('local_f3_get_list_package_to_group', data).then(response => {

      if (response.Status == 1) {

        if (!this.isCancelled) {
          // Gán thêm trường checked
          let listPackageTemp = response.Data

          listPackageTemp.map(function(item) {
            item.checked = null;
            item.random = Math.floor(Math.random() * 1000000) + 1;
            item.color_app = checkColor(item.color);
            item.type_package_app = checkTypePackage(item.barcode);
            item.hide = 0;
            return item;
          })

          // Group By
          listPackageTemp = chain(listPackageTemp).groupBy("department_to").map(function(v, i) {
            return {
              department_to: i,
              data: map(v)
            }
          }).value();

          // Lưu
          this.setState({
            ...this.state, ...{
              loading: false,
              listPackage: listPackageTemp
            }
          });
        }

      } else {
        alert('Có lỗi xảy ra. Vui lòng liên hệ admin')
      }
    })
  }

  // Bắn sứng
  changeText (text) {
    // text = 'FX0000000002561-1';
    if ((text.length - this.state.countText) > 8) {

      let itemTemp = {};
      forEach(this.state.listPackage, (itemGroup, indexGroupBy1) => {
        forEach(itemGroup.data, (item, index1) => {
          if (item.barcode === text.trim()) {
            itemTemp = item
          }
        })
      })

      if (!isEmpty(itemTemp)) {
        if (!itemTemp.checked) {
          itemTemp.checked = !itemTemp.checked;
          this.setState({
            ...this.state, ...{
              listPackage: this.state.listPackage
            }
          });
          playSoundSuccess(this.audioPlayer)
          this.dropdown.alertWithType('success', 'Thành công', 'Tìm thấy mã: ' + text);
          this.toggleAction();
        } else {
          playSoundSuccess(this.audioPlayer)
          this.dropdown.alertWithType('success', 'Thành công', 'Tìm thấy mã: ' + text);
        }
      } else {
        this.dropdown.alertWithType('warn', 'Thất bại', 'Không tìm thấy mã: ' + text);
        playSoundFail(this.audioPlayer)
      }
      this.ref.clear()

    // Nếu không phải thì thôi ko search
    } else {
      this.setState({
        ...this.state, ...{
          countText: text.length
        }
      });
    }
  }

  onPressSectionListItem =  (item, index) => () => {
    // Nếu Item chưa kích thì check xem nó cùng nơi đến không?
    if (!item.checked) {
      item.checked = !item.checked;
      // Check nếu có biến seach thì cập nhật toàn bộ hide về 0:
      if (this.state.countText) {
        this.ref.clear()
        forEach(this.state.listPackage, (itemGroup, indexGroupBy1) => {
          forEach(itemGroup.data, (item, index1) => {
            item.hide = 0;
          })
        })
        this.setState({
          ...this.state, ...{
            listPackage: this.state.listPackage,
            showCancel: 0
          }
        });
      }
    // Nếu đang được kích thì đổi trạng thái bình thường
    } else {
      item.checked = !item.checked;
      this.setState({
        ...this.state, ...{
          listPackage: this.state.listPackage
        }
      });
    }
    this.toggleAction();
  }

  // Submit search
  submitChangeText (event) {
    let text = event.nativeEvent.text;

    if (text) {
      forEach(this.state.listPackage, (itemGroup, indexGroupBy1) => {
        forEach(itemGroup.data, (item, index1) => {
          let n = item.barcode.indexOf(text);
          if (n < 0) {
            item.hide = 1;
          } else {
            item.hide = 0;
          }
        })
      })
    } else {
      forEach(this.state.listPackage, (itemGroup, indexGroupBy1) => {
        forEach(itemGroup.data, (item, index1) => {
          item.hide = 0;
        })
      })
    }

    this.setState({
      ...this.state, listPackage: this.state.listPackage
    });
  }

  clearText () {
    this.ref.clear()
    forEach(this.state.listPackage, (itemGroup, indexGroupBy1) => {
      forEach(itemGroup.data, (item, index1) => {
        item.hide = 0;
      })
    })
    this.setState({
      ...this.state, ...{
        listPackage: this.state.listPackage,
        showCancel: 0
      }
    });
    Keyboard.dismiss();
  }
  onFocusText (event) {
    if (this.state.showCancel == 0) {
      this.setState({
        ...this.state, showCancel: 1
      });
    }
  }
  clickStartScanBarcode () {
    this.ref.focus();
    Keyboard.dismiss();
  }
  // Kích hoạt nút action ở phía góc
  toggleAction () {
    let flag = false;
    forEach(this.state.listPackage, (itemGroup, indexGroupBy1) => {
      forEach(itemGroup.data, (item, index1) => {
        if (item.checked) {
          flag = true
        }
      })
    })

    if (flag) {
      this.setState({
        ...this.state, showAction: 1
      })
    } else {
      this.setState({
        ...this.state, showAction: 0
      })
    }

  }

  // Xả túi
  alertconfirmF2Group () {
    Alert.alert(
      'Xác nhận',
      'Thực hiện nhóm hàng ?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {text: 'OK', onPress: () => this.confirmF2Group() },
      ],
      {cancelable: false},
    );
  }

  // Thực hiện Lưu gói F2
  confirmF2Group () {
    this.setState({
      ...this.state, loadingModal: true
    });
    // Lấy danh sách các ID cần nhóm
    let list_package = [] // Danh sách ID các FX cần nhóm

    let indexGroupBy = -1;
    let index = -1;

    forEach(this.state.listPackage, (itemGroup, indexGroupBy1) => {
      forEach(itemGroup.data, (item, index1) => {
        if (item.checked) {
          list_package.push(item.id)

          indexGroupBy = indexGroupBy1
          index = index1;
        }
      })
    })

    let data = {
      "from_department_id": this.props.accountState.workDepartment.department_id,
      "to_department_id": this.state.toDepartment.id,
      "list_package_id": list_package
    }

    console.log(data);

    axios.post('local_f3_group', data).then(response => {
      console.log(response)
      if (response.Status == 1) {
        if (!this.isCancelled) {
          this.setState({
            ...this.state, ...{
              loadingModal: false,
              toDepartment: {}
            }
          });
          this.dropdown.alertWithType('success', 'Thành công', 'Nhóm F3 thành công');
          this.fetchLocalF2GetListPackageToGroup()
        }
      } else {
        alert('Có lỗi xảy ra. Vui lòng liên hệ admin')
      }
    })
  }

  handleRefresh = () => {
    this.dropdown.alertWithType('info', 'Thành công', 'Làm mới dữ liệu thành công !');
    this.fetchLocalF2GetListPackageToGroup(false)
  }
  render() {
    return (
      <View style={styles.container}>
        <Loader loading={ this.state.loadingModal } />
        <View style={{ height: 50, alignItems: 'center', justifyContent: 'space-between', display: 'flex', flexDirection: 'row', backgroundColor: '#fff' }}>
          <TouchableOpacity  onPress={ () => this.props.navigation.navigate('DashboradStack') } >
            <View style={{ height: 50, display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
              <View style={{ width: 40 }}>
                <MaterialIcons name='navigate-before' size={ 35 } color='#000' style={{ fontWeight: 'bold' }} />
              </View>
              <Text style={{ fontWeight: 'bold', fontSize: 18 }}>Nhóm F3</Text>
            </View>
          </TouchableOpacity>
          {
            (this.state.showAction == 1 && this.state.toDepartment.id) &&
            <TouchableOpacity onPress={ () => this.alertconfirmF2Group() }>
              <View style={{ minWidth: 75, height: 44, paddingRight: 10, justifyContent: 'center', display: 'flex' }}>
                <Text style={{ fontSize: 15, color: '#000', fontWeight: 'bold' }}>Xác nhận</Text>
              </View>
            </TouchableOpacity>
          }
        </View>
        <View style={{ paddingLeft: 5, paddingRight: 5, paddingBottom: 15, paddingTop: 10, display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
          <TextInput
            ref={ref => (this.ref = ref)}
            placeholder="Quét hoặc gõ tìm kiếm"
            onChangeText={(text) => this.changeText(text)}
            onSubmitEditing={(event) => this.submitChangeText(event) }
            onFocus={(event) => this.onFocusText(event) }
            style={{ height: 30, backgroundColor: 'rgba(0,0,0,0.05)', paddingLeft: 34, borderRadius: 4, flexGrow: 1 }}>
            </TextInput>
            <Ionicons name='ios-search' size={ 16 } color='#000' style={{ position: 'absolute', top: 16, left: 15, color: 'rgba(0,0,0,0.2)' }} />
            <TouchableOpacity onPress={ () => this.clearText() }>
              <View style={{ width: this.state.showCancel ? 60 : 0, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ color: '#000' }}>Xóa</Text>
              </View>
            </TouchableOpacity>
        </View>
        <TouchableOpacity onPress={() => this.props.navigation.navigate('F3DepartmentGroupToForCurrentDepartmentScreen', {
          'toDepartment': this.state.toDepartment
        })}>
          <View style={{ height: 30, borderRadius: 5, marginLeft: 5, marginRight: 5, marginBottom: 10, paddingLeft: 10, borderWidth: 1, borderColor: '#ccc', justifyContent: 'center' }}>
            {
              this.state.toDepartment.name ?
              <Text>
                {this.state.toDepartment.name}
              </Text>
              :
              <Text style={{ color: '#ccc' }}>Chọn nơi đến ...</Text>
            }
            <MaterialCommunityIcons name='menu-down' size={ 22 } color='#4a4a4a' style={{ position: 'absolute', right: 10 }} />
          </View>
        </TouchableOpacity>
        {
          this.state.loading &&
          <Spinner color='#22409A' size='small' style={{ paddingRight: 15 }} />
        }
        <View style={{ flex: 1, backgroundColor: '#fff' }}>
          {
            this.state.listPackage.length > 0 &&
            <SectionList
              sections={this.state.listPackage}
              renderItem={({ item, index }) => {
                return (
                  <SectionListItem onPress={this.onPressSectionListItem(item, index)} item={item} index={index} >
                  </SectionListItem>
                );
              }}
              keyExtractor={(item, index) => item.barcode}
              renderSectionHeader={({ section }) => {
                  return (<SectionHeader section={section} />);
              }}
              stickySectionHeadersEnabled={true}
              refreshing={this.state.refreshing}
              onRefresh={this.handleRefresh}
              extraData={this.state}
            >
            </SectionList>
          }
          {
            (!this.state.loading && this.state.listPackage.length === 0) &&
            <View style={{ alignItems: 'center', justifyContent: 'center', paddingTop: 15 }}>
              <Text>Không có dữ liệu !</Text>
            </View>
          }
        </View>
        <DropdownAlert
          closeInterval={1500}
          updateStatusBar={false}
          defaultContainer={{padding: 8, paddingTop: 20, flexDirection: 'row'}}
          ref={ref => this.dropdown = ref} />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
    paddingTop: Platform.OS === 'ios' ? (isIphoneXorAbove() ? 44 : 20) : StatusBar.currentHeight
  }
});

const mapStateToProps = state => ({
  accountState: state.accountState,
  f3State: state.f3State
});

export default connect(mapStateToProps, null)(F3GroupScreen);
