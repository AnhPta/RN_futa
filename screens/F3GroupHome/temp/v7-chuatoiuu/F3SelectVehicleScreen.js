import React, { Component } from 'react';
import { StyleSheet, Text, View, Button, Platform, StatusBar, TouchableOpacity, ScrollView, TextInput, Modal, Alert , ActivityIndicator} from 'react-native';

import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Spinner, DatePicker, Picker } from 'native-base';

import { isIphoneXorAbove } from "../../filters";

import axios from "../../axios"
import { connect } from 'react-redux';
import { findIndex, forEach } from 'lodash'

class F3SelectVehicleScreen extends Component {

  constructor(props) {
    super(props);

    this.isCancelled = false;

    this.state = {
      loading: false,
      loadingF3Go: false,
      date: '',
      way_id: '',
      vehicle_shifting_order_id: '', // ID xe mà được chọn để chở hàng đi
      wayForDepartment: [], // Lộ trình của văn phòng
      listVehicle: [] // Danh sách xe
    };
  }

  componentDidMount() {
    this.isCancelled = false;
    const { params } = this.props.navigation.state
    this.fetchLocalF3GetAllWayForDepartment();
    this.fetchLocalF3GetListVehicle();
    // Set ngày mặc định là ngày hiện tại
    //
    let dateDefault = new Date();
    this.setState({
      ...this.state, ...{
        date: this.formatDate(dateDefault.toString())
      }
    });
  }

  componentWillUnmount() {
    this.isCancelled = true;
  }

  setDate(newDate) {
    this.setState({ date: newDate });
  }

  // Lấy lộ trình của văn phòng: LocalF3GetAllWayForDepartment
  fetchLocalF3GetAllWayForDepartment () {
    let data = {
      "department_id": this.props.accountState.workDepartment.department_id
    }
    axios.post('local_f3_get_all_way_for_department', data).then(response => {
      if (response.Status == 1) {
        if (!this.isCancelled) {
          this.setState({
            ...this.state, ...{
              loading: false,
              wayForDepartment: response.Data
            }
          });
        }
      } else {
        alert('Có lỗi xảy ra. Vui lòng liên hệ admin')
      }
    })
  }

  // Đổi lộ trình
  changePicker (way_id) {
    this.setState({
      ...this.state, ...{
        way_id: way_id,
        loading: true
      }
    });
    this.fetchLocalF3GetListVehicle(way_id, this.state.date)
  }

  // Đổi ngày đi
  changeDatePicker (newDate) {

    this.setState({
      ...this.state, ...{
        date: this.formatDate(newDate.toString()),
        loading: true
      }
    });
    this.fetchLocalF3GetListVehicle(this.state.way_id, this.formatDate(newDate.toString()))
  }

  formatDate(date) {
    var d = new Date(date),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();

    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;

    return [year, month, day].join('-');
  }

  // Chọn lái xe
  selectVehicle (index) {
    console.log('dưqdqdwqdqwd');
    forEach(this.state.listVehicle, (item) => {
      item.checked = 0
    })

    this.state.listVehicle[index].checked = !this.state.listVehicle[index].checked

    this.setState({
      ...this.state, ...{
        listVehicle: this.state.listVehicle,
        vehicle_shifting_order_id: this.state.listVehicle[index].id
      }
    });
  }


  // Lấy danh sách phương tiện
  fetchLocalF3GetListVehicle (way_id, date) {
    let data = {
      "way_id": way_id,
      "date_start": date
    }
    console.log('Fetch data nè');
    console.log(data);
    axios.post('local_f3_get_list_vehicle', data).then(response => {
      if (response.Status == 1) {
        if (!this.isCancelled) {
          let listPackageTemp = response.Data

          listPackageTemp.map(function(item) {
            item.checked = 0;
            item.hide = 0;
            return item;
          })
          console.log(listPackageTemp);
          this.setState({
            ...this.state, ...{
              listVehicle: listPackageTemp,
              loading: false,
              vehicle_shifting_order_id: ''
            }
          });
        }
      } else {
        alert('Có lỗi xảy ra. Vui lòng liên hệ admin')
      }
    })
  }

  confirmF3Go () {
    if (this.state.vehicle_shifting_order_id === '') {
      alert('Vui lòng chọn xe')
      return
    }
    this.setState({
      ...this.state, ...{
        loadingF3Go: true
      }
    });

    const { params } = this.props.navigation.state
    let data = {
      "f3_id": params.f3_item.id,
      "vehicle_shifting_order_id": this.state.vehicle_shifting_order_id
    }

    console.log('hóm đi');
    console.log(data);

    // Nhóm đi
    axios.post('local_f3_confirm_go', data).then(response => {
      if (response.Status == 1) {
        console.log(response);
        if (!this.isCancelled) {
          this.setState({
            ...this.state, ...{
              loadingF3Go: false
            }
          });
          this.props.navigation.navigate('F3ListScreen')
        }
      } else {
        alert('Có lỗi xảy ra. Vui lòng liên hệ admin')
      }
    })
  }

  render() {
    const { params } = this.props.navigation.state
    return (
      <View style={styles.container}>
        <View style={{ height: 44, alignItems: 'center', justifyContent: 'space-between', display: 'flex', flexDirection: 'row', paddingLeft: 10, paddingRight: 10 }}>
          <TouchableOpacity onPress={ () => this.props.navigation.goBack(null) }>
            <View style={{ height: 44, display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
              <View style={{ width: 40 }}>
                <Text>Trở lại</Text>
              </View>
            </View>
          </TouchableOpacity>
          <Text style={{ fontWeight: 'bold', fontSize: 16 }}>Bảng tài điều xe</Text>
          <View style={{ height: 44, paddingRight: 10, justifyContent: 'center', display: 'flex' }}>
            <Text style={{ fontSize: 15, color: '#000' }}></Text>
          </View>
        </View>
        <View style={{ display: 'flex', paddingLeft: 10, paddingRight: 10 }}>
          <View style={{ height: 50, display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
            <Text style={{ width: 120 }}>Lộ trình:</Text>
            <View style={{ height: 40, flexGrow: 1,  borderBottomColor: '#ccc', borderBottomWidth: 1, borderRadius: 2 }}>
              <Picker
                note
                selectedValue={this.state.way_id}
                mode="dropdown"
                onValueChange={ (way_id) => this.changePicker(way_id) }>
                <Picker.Item label="Chọn lộ trình" value="" />
                {
                  this.state.wayForDepartment.map((item) => {
                      return (
                        <Picker.Item key={ item.name }label={ item.name } value={ item.route_supplier_id } />
                      )
                  })
                }

              </Picker>
            </View>

          </View>
          <View  style={{ height: 50, display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
            <Text style={{ width: 120 }}>Ngày khởi hành:</Text>
            <DatePicker
              style={{ backgroundColor: 'red' }}
              defaultDate={new Date()}
              minimumDate={new Date(2018, 1, 1)}
              maximumDate={new Date(2030, 12, 31)}
              locale={"vi"}
              timeZoneOffsetInMinutes={undefined}
              modalTransparent={false}
              animationType={"fade"}
              androidMode={"default"}
              textStyle={{ color: "#000" }}
              placeHolderTextStyle={{ color: "#d3d3d3" }}
              onDateChange={(newDate) => this.changeDatePicker(newDate)}
              disabled={false}
              />
              <MaterialCommunityIcons name='calendar-clock' size={ 20 } color='#4a4a4a' />
          </View>
          <View  style={{ height: 50, display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
            <Text style={{ width: 120 }}>Chọn xe:</Text>
          </View>
        </View>
        <ScrollView>
          {
            this.state.loading &&
            <ActivityIndicator size="small" color="#22409A" style={{ paddingBottom: 15 }} />
          }
          {
            this.state.listVehicle.map((item, index) => {
              return (
                <TouchableOpacity key={item.id} onPress={ () => this.selectVehicle(index) }>
                  <View style={{ height: 100, borderBottomWidth: 1, borderColor: '#F3F3F3', display: 'flex', flexDirection: 'row', alignItems:'center', marginRight: 10, marginLeft: 10, justifyContent: 'space-between' }}>
                    <View style={{ display: 'flex', flexDirection: 'row', alignItems:'center', flex: 45 }}>
                      {
                        item.checked ?
                          <MaterialCommunityIcons name='check-circle' size={ 22 } color='#000' style={{ marginRight: 5 }} />
                        :
                        <MaterialCommunityIcons name='checkbox-blank-circle-outline' size={ 22 } color='#000' style={{ marginRight: 5 }} />
                      }
                      <View style={{ display: 'flex', marginLeft: 5 }}>
                        <Text style={{ fontWeight: 'bold' }}>{ item.number_plate }</Text>
                        <Text style={{ color: '#4a4a4a', fontSize: 12 }}>{ item.vehicle_type_name }/{ item.Capacity } tấn</Text>
                        <Text style={{ color: '#4a4a4a', fontSize: 12 }}>NCC: { item.supplier_name }</Text>
                      </View>
                    </View>
                    <View style={{ flex: 55 }}>
                      <View style={{ borderBottomColor: '#f2f2f2', borderBottomWidth: 1, paddingBottom: 3 }}>
                        <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                          <MaterialCommunityIcons name='account-circle' size={ 14 } color='#000' style={{ marginRight: 5 }} />
                          <Text style={{ fontWeight: 'bold' }}>1.{item.driver1_name}</Text>
                        </View>
                        <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                          <MaterialCommunityIcons name='phone' size={ 14 } color='#000' style={{ marginRight: 5 }} />
                          <Text style={{ fontSize: 13 }}>{item.driver1_phone}</Text>
                        </View>
                      </View>

                      <View style={{ paddingTop: 3 }}>
                        <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                          <MaterialCommunityIcons name='account-circle' size={ 14 } color='#000' style={{ marginRight: 5 }} />
                          <Text style={{ fontWeight: 'bold' }}>2.{item.driver2_name}</Text>
                        </View>
                        <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                          <MaterialCommunityIcons name='phone' size={ 14 } color='#000' style={{ marginRight: 5 }} />
                          <Text style={{ fontSize: 13 }}>{item.driver2_phone}</Text>
                        </View>
                      </View>


                    </View>

                  </View>
                </TouchableOpacity>
              )
            })
          }
        </ScrollView>
        <View style={{ height: 60 }}>
          <TouchableOpacity  disabled={this.state.loadingF3Go} onPress={ () => this.confirmF3Go() }  style={{ backgroundColor: this.state.loadingF3Go ? '#ccc' : '#f2f2f2', flex: 50, height: 35, marginLeft: 10, marginRight: 10, marginBottom: 10,alignItems: 'center',  justifyContent: 'center', borderRadius: 4 }}>
            <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
              <Text style={{ fontSize: 15, fontWeight: 'bold', marginRight: 5 }}>Xác nhận đi</Text>
              { this.state.loadingF3Go && <Spinner color='white' size='small' /> }
            </View>
          </TouchableOpacity>
        </View>
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

export default connect(mapStateToProps, null)(F3SelectVehicleScreen);
