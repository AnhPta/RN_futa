import React, { Component } from 'react';
import { StyleSheet, Text, View, Button, TouchableOpacity, ScrollView, TextInput, Alert , Keyboard, StatusBar, Platform, FlatList} from 'react-native';

import { MaterialIcons, MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { Spinner } from 'native-base';

import DropdownAlert from 'react-native-dropdownalert';

import { isIphoneXorAbove } from "../../filters";

import axios from "../../axios"
import { connect } from 'react-redux';
import { findIndex, forEach, chain, groupBy, map, filter, isEmpty } from 'lodash'
import { Audio } from 'expo';
import Loader from '../Helper/Loader';

import { playSoundSuccess, playSoundFail } from "../Helper/Funtions"

class SectionListItem extends Component {
  constructor(props) {
    super(props)
    this.state = {
      hide: 0,
      random: 0,
    }
  }
  // Initialize the states
  componentWillMount() {
    const {  hide, random } = this.props.item
    this.setState({  hide, random })
  }
  componentWillReceiveProps(nextProps) {
    const {  hide, random } = nextProps.item
    this.setState({  hide, random })
  }
  shouldComponentUpdate(nextProps, nextState) {
    // console.log('==========STATE=============');
    // console.log(this.state);
    // console.log('==========NEXT STATE=============');
    // console.log(nextState);
    const {  hide, random } = nextState
    const {  hide: oldHide, random: oldRandom } = this.state
    // console.log(!== oldChecked || hide !== oldHide);
    return hide !== oldHide || random != oldRandom;
  }
  render() {
    const item = this.props.item
    const index = this.props.index
    if (!item.hide) {
      return (
        <TouchableOpacity key={item.barcode} onPress={ this.props.onPress }>
          <View style={{ height: 70, borderBottomWidth: 1, borderColor: '#F3F3F3', display: 'flex', flexDirection: 'row', alignItems:'center', marginRight: 10, marginLeft: 10, justifyContent: 'space-between' }}>

            <View style={{ display: 'flex', flexDirection: 'row', alignItems:'center', flex: 60 }}>
              <View style={{ display: 'flex', flexDirection: 'column', marginLeft: 5 }}>
                <Text style={{ fontSize: 14, fontWeight: 'bold' }}>{ index + 1} - { item.barcode }</Text>
                <Text style={{ marginTop: 4, fontSize: 13, color: '#4a4a4a' }}>Tới: { item.to_department_name }</Text>
              </View>
            </View>

            <View style={{ flex: 40, alignItems: 'flex-end', flexDirection: 'column' }}>
              <Text style={{ fontSize: 12 }}>NV nhóm { item.fullname }</Text>
            </View>

          </View>
        </TouchableOpacity>
      )
    } else {
      return null;
    }
  }
}

class F3ListScreen extends Component {

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
      listPackageF1: [],
      item: {}
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
        this.fetchLocalF2GetListPackageToGroup(true);
        const { params } = this.props.navigation.state
        if (params && params.reload) {
          this.dropdown.alertWithType('success', 'Thành công', 'Xả túi F3 thành công');
          this.fetchLocalF2GetListPackageToGroup(false);
          this.props.navigation.setParams({reload: 0})
        }
      }
    );
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
    axios.post('local_f3_get_list_f3_in_department', data).then(response => {
      if (response.Status == 1) {
        if (!this.isCancelled) {
          // Gán thêm trường checked
          let listPackageTemp = response.Data

          listPackageTemp.map(function(item) {
            item.hide = 0;
            item.random = Math.floor(Math.random() * 1000000) + 1;
            return item;
          })

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
    // text = 'F30000000001007';
    if ((text.length - this.state.countText) > 8) {

      let itemTemp = {};
      forEach(this.state.listPackage, (item) => {
        if (item.barcode === text.trim()) {
          itemTemp = item
        }
      })

      if (!isEmpty(itemTemp)) {
        playSoundSuccess(this.audioPlayer)
        this.props.navigation.navigate('F3DetailScreen', {
          'f3_item': itemTemp
        })
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

  // Submit search
  submitChangeText (event) {
    let text = event.nativeEvent.text;
    if ((text.length - this.state.countText) === 0) {
      forEach(this.state.listPackage, (item) => {
        let n = item.barcode.indexOf(text);
        if (n < 0) {
          item.hide = 1;
        } else {
          item.hide = 0;
        }
      })
    } else {
      forEach(this.state.listPackage, (item) => {
        item.hide = 0;
      })
    }

    this.setState({
      ...this.state, listPackage: this.state.listPackage
    });
  }

  clearText () {
    this.ref.clear()
    forEach(this.state.listPackage, (item) => {
      item.hide = 0;
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

  onPressSectionListItem =  (item, index) => () => {
    this.props.navigation.navigate('F3DetailScreen', {
      'f3_item': item
    })
  }

  handleRefresh = () => {
    this.dropdown.alertWithType('info', 'Thành công', 'Làm mới dữ liệu thành công !');
    this.fetchLocalF2GetListPackageToGroup(false)
  }


  render() {
    return (
      <View style={styles.container}>
        <View style={{ height: 50, alignItems: 'center', justifyContent: 'space-between', display: 'flex', flexDirection: 'row', backgroundColor: '#fff' }}>
          <TouchableOpacity  onPress={ () => this.props.navigation.navigate('DashboradStack') } >
            <View style={{ height: 50, display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
              <View style={{ width: 40 }}>
                <MaterialIcons name='navigate-before' size={ 35 } color='#000' style={{ fontWeight: 'bold' }} />
              </View>
              <Text style={{ fontWeight: 'bold', fontSize: 18 }}>Danh sách F3</Text>
            </View>
          </TouchableOpacity>
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
        {
          this.state.loading &&
          <Spinner color='#22409A' size='small' style={{ paddingRight: 15 }} />
        }
        <View style={{ flex: 1, backgroundColor: '#fff' }}>
          {
            this.state.listPackage.length > 0 &&
            <FlatList
              data={this.state.listPackage}
              renderItem={({ item, index }) => {
                return (
                  <SectionListItem onPress={this.onPressSectionListItem(item, index)} item={item} index={index} >
                  </SectionListItem>
                );
              }}
              keyExtractor={item => item.id.toString()}
              refreshing={this.state.refreshing}
              onRefresh={this.handleRefresh}
              extraData={this.state}>
            </FlatList>
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
  accountState: state.accountState
});

export default connect(mapStateToProps, null)(F3ListScreen);
