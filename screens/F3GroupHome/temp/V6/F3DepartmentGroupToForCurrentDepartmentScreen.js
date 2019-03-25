import React, { Component } from 'react';
import { StyleSheet, Text, View, Button, TouchableOpacity, ScrollView, TextInput, Modal, Alert, Dimensions , Keyboard} from 'react-native';

import { MaterialIcons, MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { Spinner } from 'native-base';

import axios from "../../axios"
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { f3SetGroupToDepartment, f3SetListDepartment, f3ChangeItemDepartment } from './redux/action';
import { forEach, map } from 'lodash'


class F3DepartmentGroupToForCurrentDepartmentScreen extends Component {

  constructor(props) {
    super(props);
    this.isCancelled = false;
    this.state = {
      loading: false,
      listDepartmentToDepartment: [],
      showCancel: 0,
      q: ''
    };
  }

  componentDidMount() {
    this.isCancelled = false;
    this.fetchListDepartmentToDepartmentForDepartment();
  }

  componentWillUnmount() {
    this.isCancelled = true;
  }

  // Lấy danh sách các phòng giao dịch có thể nhóm vào
  fetchListDepartmentToDepartmentForDepartment () {
    this.setState({
      ...this.state, loading: true
    });
    let data = {
      "current_department_id": this.props.accountState.workDepartment.department_id
    }
    axios.post('local_f3_get_department_group_to_for_current_department', data).then(response => {
      if (response.Status == 1) {
        if (!this.isCancelled) {

          let listPackageTemp = response.Data

          listPackageTemp.map(function(item) {
            item.hide = 0;
            item.checked = 0;
            return item;
          })

          this.setState({
            ...this.state, ...{
              loading: false,
              // listDepartmentToDepartment: listPackageTemp
            }
          });
          this.props.f3SetListDepartment(listPackageTemp)
        }
      } else {
        alert('Có lỗi xảy ra. Vui lòng liên hệ admin')
      }
    })
  }

  onChangeText (text) {
    listPackageTemp = this.state.listDepartmentToDepartment;
    forEach(listPackageTemp, (item,) => {
      if (item.name) {
        let n = item.name.indexOf(text.toUpperCase());
        if (n < 0) {
          item.hide = 1;
        } else {
          item.hide = 0;
        }
      }
    })

    this.setState({
      ...this.state, ...{
        listDepartmentToDepartment: listPackageTemp
      }
    });
  }

  clearText () {
    this.ref.clear()
    listPackageTemp = this.state.listDepartmentToDepartment;
    forEach(listPackageTemp, (item,) => {
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

  selectDepartment (item, index) {
    this.props.f3ChangeItemDepartment(index)
    // this.props.f3SetGroupToDepartment(item);
  }

  render() {
    return (
      <View style={styles.container}>
        <View style={{ height: 44, alignItems: 'center', justifyContent: 'space-between', display: 'flex', flexDirection: 'row' }}>
          <TouchableOpacity  onPress={ () => this.props.navigation.goBack(null) } >
            <View style={{ height: 44, display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
              <View style={{ width: 40 }}>
                <MaterialIcons name='navigate-before' size={ 35 } color='#000' style={{ fontWeight: 'bold' }} />
              </View>
              <Text style={{ fontWeight: 'bold', fontSize: 18 }}>Nhóm đến</Text>
            </View>
          </TouchableOpacity>
        </View>
        <View style={{ paddingLeft: 5, paddingRight: 5, paddingBottom: 15, paddingTop: 10, display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
          <TextInput
            ref={ref => (this.ref = ref)}
            placeholder="Gõ tìm kiếm"
            onChangeText={(text) => this.onChangeText(text) }
            onFocus={(event) => this.onFocusText(event) }
            style={{ height: 30, backgroundColor: 'rgba(0,0,0,0.05)', paddingLeft: 34, borderRadius: 4, flexGrow: 1 }}>
            </TextInput>
            <Ionicons name='ios-search' size={ 16 } color='#000' style={{ position: 'absolute', top: 16, left: 15, color: 'rgba(0,0,0,0.2)' }} />
            <TouchableOpacity onPress={ () => this.clearText() }>
              <View style={{ width: this.state.showCancel ? 60 : 0, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ color: '#3498db' }}>Cancel</Text>
              </View>
            </TouchableOpacity>
        </View>
        <ScrollView>
          {
            this.state.loading &&
            <Spinner color='#22409A' size='small' style={{ paddingRight: 15 }} />
          }
          <View>
            {
              this.props.f3State.listDepartment.map((item, index) => {
                if (!item.hide) {
                  return (
                    <TouchableOpacity key={item.id} onPress={ () => this.selectDepartment(item, index) }>
                      {
                        item.checked ?
                          <MaterialCommunityIcons name='check-circle' size={ 22 } color='#000' style={{ marginRight: 5 }} />
                        :
                        <MaterialCommunityIcons name='checkbox-blank-circle-outline' size={ 22 } color='#000' style={{ marginRight: 5 }} />
                      }
                      <View style={{ height: 70, borderBottomWidth: 1, borderColor: '#F3F3F3', display: 'flex', flexDirection: 'row', alignItems:'center', marginRight: 10, marginLeft: 10, justifyContent: 'space-between' }}>
                      <View style={{ flex: 90 }}>
                        <Text>{ item.name }</Text>
                        <Text style={{ color: '#4a4a4a', fontSize: 10 }}>{ item.address }</Text>
                      </View>
                      <MaterialCommunityIcons name='checkbox-blank-circle-outline' size={ 22 } color='#000' style={{ marginLeft: 12, flex: 10 }} />

                      </View>
                    </TouchableOpacity>
                  )
                }
              })
            }
          </View>
        </ScrollView>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
    paddingTop: 20
  }
});

const mapStateToProps = state => ({
  accountState: state.accountState,
  f3State: state.f3State
});

const mapDispatchToProps = dispatch => (
  bindActionCreators(
    {
      f3SetGroupToDepartment,
      f3SetListDepartment,
      f3ChangeItemDepartment
    }, dispatch
  )
);

export default connect(mapStateToProps, mapDispatchToProps)(F3DepartmentGroupToForCurrentDepartmentScreen);
