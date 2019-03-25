import React, { Component } from 'react';
import { StyleSheet, Text, View, Button, Platform, StatusBar, TouchableOpacity, ScrollView, TextInput, Modal, Alert, Dimensions } from 'react-native';

import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Spinner } from 'native-base';

import { Checkbox } from 'react-native-paper';

import axios from "../../axios"
import { connect } from 'react-redux';
import { findIndex, forEach, keyBy } from 'lodash'
import { Audio } from 'expo';
import DropdownAlert from 'react-native-dropdownalert';

import { checkColor, checkTypePackage, playSoundSuccess, playSoundFail } from "../Helper/Funtions"

class F2ListScreen extends Component {

  constructor(props) {
    super(props);
    this.isCancelled = false;
    this.state = {
      loading: false,
      listPackage: [],
      countText: 0
    };
    this.audioPlayer = new Audio.Sound();
  }

  componentDidMount() {
    this.isCancelled = false;
    this.didFocusListener = this.props.navigation.addListener(
      'didFocus',
      () => { this.fetchLocalF2GetListPackageToGroup() },
    );

  }

  componentWillUnmount() {
    this.isCancelled = true;
    this.didFocusListener.remove();
  }

  fetchLocalF2GetListPackageToGroup () {
    this.setState({
      ...this.state, loading: true
    });

    let data = {
      "department_id": this.props.accountState.workDepartment.department_id
    }
    axios.post('local_f3_get_list_f3_in_department', data).then(response => {
      if (response.Status == 1) {
        console.log('fetchLocalF3GetListPackageToGroup')
        console.log(response);
        if (!this.isCancelled) {
          // Lưu
          this.setState({
            ...this.state, ...{
              loading: false,
              listPackage: response.Data
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
    // Kiểm tra nếu text thay đổi độ dài đột ngột do bắn súng thì search luôn

    if ((text.length - this.state.countText) > 8) {
      let index = findIndex(this.state.listPackage, function (o) {
        return o.barcode === text.trim()
      })
      if (index >= 0) {
        let item = this.state.listPackage[index];
        playSoundSuccess(this.audioPlayer)
        this.getF3Detail(item)
      } else {
        playSoundFail(this.audioPlayer)
      }
      this.ref.clear()
    } else {
      this.setState({
        ...this.state, ...{
          countText: text.length
        }
      });
    }
  }

  submitChangeText (event) {
    let index = findIndex(this.state.listPackage, function (o) {
      return o.barcode === event.nativeEvent.text.trim()
    })
    if (index >= 0) {
      let item = this.state.listPackage[index];
      this.ref.clear()
      playSoundSuccess(this.audioPlayer)
      this.getF3Detail(item)
    } else {
      playSoundFail(this.audioPlayer)
      this.dropdown.alertWithType('warn', 'Cảnh báo', 'Không tìm thấy mã vừa nhập');
    }
  }


  getF3Detail (item) {
    this.props.navigation.navigate('F3DetailScreen', {
      'f3_item': item
    })
  }
  render() {
    const DeviceWidth = Dimensions.get('window').width - 150
    return (
      <View style={styles.container}>
        <View style={{ height: 50, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'space-between', display: 'flex', flexDirection: 'row' }}>
          <TouchableOpacity  onPress={ () => this.props.navigation.navigate('DashboradStack') } >
            <View style={{ minWidth: 75, height: 50, paddingLeft: 15, justifyContent: 'center', display: 'flex' }}>
              <MaterialIcons name='close' size={26} color='#535c68' />
            </View>
          </TouchableOpacity>
          <View style={{ width: DeviceWidth }}>
            <TextInput
              ref={ref => (this.ref = ref)}
              placeholder="Quét mã tìm F2 ..."
              onChangeText={(text) => this.changeText(text)}
              onSubmitEditing={(event) => this.submitChangeText(event) }
              style={{height: 40, width: '100%', borderColor: '#ddd', borderWidth: 1.5, paddingLeft: 40, borderRadius: 3 }}/>
            <MaterialCommunityIcons style={{ position: 'absolute', top: 10, left: 10 }} name='barcode-scan' size={20} color='#535c68' />
            <TouchableOpacity style={{ height: 40, width: 40, alignItems: 'center', position: 'absolute', top: 10, right: 0 }} onPress={ () => this.ref.clear() }>
              <MaterialCommunityIcons name='close' size={20} color='#535c68' />
            </TouchableOpacity>
          </View>
          <TouchableOpacity>
            <View style={{ minWidth: 75, height: 50, paddingLeft: 15, justifyContent: 'center', display: 'flex' }}>

            </View>
          </TouchableOpacity>
        </View>
        <ScrollView>
          <View style={{ paddingTop: 10 }}>
            {
              this.state.listPackage.map((item, index) => {
                return (
                  <TouchableOpacity key={item.barcode} onPress={ () => this.getF3Detail(item)  }>
                    <View style={{ height: 90, backgroundColor: '#fff', borderBottomWidth: 1, borderColor: '#F3F3F3', display: 'flex', flexDirection: 'row', alignItems:'center', paddingRight: 10, paddingLeft: 1, justifyContent: 'space-between' }}>

                      <View style={{ display: 'flex', flexDirection: 'row', alignItems:'center', flex: 65 }}>
                        <View style={{ width: 3, height: 88, backgroundColor: item.color_app, marginRight: 5 }}></View>
                        <View style={{ display: 'flex', flexDirection: 'column', marginLeft: 5 }}>
                          <Text style={{ fontSize: 16, fontWeight: 'bold' }}>{ item.barcode }</Text>
                          <Text style={{ marginTop: 5, fontSize: 11 }}>Đến: { item.to_department_name }</Text>
                        </View>
                      </View>

                      <View style={{ flex: 25, alignItems: 'center', flexDirection: 'column' }}>
                        <Text style={{ fontSize: 12 }}></Text>
                        <Text style={{ fontSize: 12 }}></Text>
                      </View>

                      <View style={{ flex: 10 }}>
                        <MaterialIcons name='navigate-next' size={24} color='#535c68' />
                      </View>
                    </View>
                  </TouchableOpacity>
                )
              })
            }
          </View>
          {
            this.state.loading &&
            <Spinner color='#22409A' size='small' style={{ paddingRight: 15 }} />
          }
        </ScrollView>
        <DropdownAlert
          closeInterval={1500}
          defaultContainer={{padding: 8, paddingTop: Platform.OS === 'ios' ? 0 : 20, flexDirection: 'row'}}
          ref={ref => this.dropdown = ref} />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EEEEEE',
    paddingTop: Platform.OS === 'ios' ? (isIphoneX() ? 44 : 22) : StatusBar.currentHeight
  }
});

const mapStateToProps = state => ({
  accountState: state.accountState
});

export default connect(mapStateToProps, null)(F2ListScreen);
