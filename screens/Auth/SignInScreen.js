import React, { Component } from 'react';

import { StyleSheet, Alert, Image, KeyboardAvoidingView, View, AsyncStorage, Keyboard, Modal, TouchableOpacity, StatusBar, Platform } from 'react-native';
import { Button, Text, Icon, Form, Item, Label, Input, Picker, Spinner } from 'native-base';

import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';

import { isIphoneXorAbove } from "../../filters";

import axios from "../../axios"
import { findIndex } from 'lodash'

class SignInScreen extends Component {

  constructor(props) {
    super(props);
    this.state = {
      modalVisible: false,
      loadingLogin: false,
      loadingSelectDepartment: false,
      username: '12400',
      password: '123456',
      department_id: '',
      listWorkDepartment: [

      ]
    };
  }

  login () {
    if (this.validateData()) {
      this.requestLogin()
    }
  }

  validateData (type = 1) {
    if (this.state.username === '') {
      Alert.alert(
        'Thông báo',
        'Vui lòng nhập email !'
      );
      return false;
    }
    if (this.state.password === '') {
      Alert.alert(
        'Thông báo',
        'Vui lòng nhập mật khẩu !'
      );
      return false;
    }
    return true;
  }

  requestLogin () {
    this.setState({
      ...this.state, loadingLogin: true
    });
    Keyboard.dismiss();

    let dataLogin = {
      "grant_type":"password",
      "client_id":"55cb2757-65ea-4b59-8be6-b59d0c9d0311",
      "client_secret":"W5153rRj505251q5054PUcRyQAfgwdeiK555549CsEv56Iw49M48XVC5555I4853wGsoF51555256IQdQW55jE",
      "scope":"offline_access ReadCategory ReadBill Local ReadSelfProfile",
      "username": this.state.username,
      "password": this.state.password
    }

    console.log(new Date());
    fetch('https://identity-sandbox.futabus.vn/oauth2/v1/token', {
      method: 'POST',
      headers: {
         Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(dataLogin),
    })
    .then((response) => response.json())
    .then((responseJson) => {
      console.log(new Date());
      this.setState({...this.state, loadingLogin: false});

      if (responseJson.error) {
        if (responseJson.error_description) {
          Alert.alert(
            'Thất bại',
            responseJson.error_description
          );
        } else {
          Alert.alert('Thất bại','Có lỗi xảy ra. Vui lòng liên hệ admin !');
        }
      } else {
        this._storeData(responseJson.access_token);
      }

    })
    .catch((error) =>{
      console.error(error);
    });
  }

  _storeData = async (access_token) => {
    try {
      await AsyncStorage.setItem('userToken', access_token);
      this.fetchBranch()
    } catch (error) {

    }
  }

  fetchBranch () {
    this.setState({
      ...this.state, ...{
        loadingSelectDepartment: true,
        modalVisible: true,
      }
    });
    axios.get('account_get_list_work_department').then(response => {
      if (response.Status == 1) {
        console.log(response.Data);
        this.setState({
          ...this.state, ...{
            loadingSelectDepartment: false,
            listWorkDepartment: response.Data
          }
        });
      } else {
        alert('Có lỗi xảy ra. Vui lòng liên hệ admin')
      }
    })
  }

  selectWorkDepartmantAndLogin (department_id) {
    let index = findIndex(this.state.listWorkDepartment, function (o) {
      return o.department_id === department_id
    })
    this._storeWorkDepartment(this.state.listWorkDepartment[index])
  }

  _storeWorkDepartment = async (workDepartment) => {
    try {
      await AsyncStorage.setItem('userWorkDepartment', JSON.stringify(workDepartment));
      this.props.navigation.navigate('Main')
    } catch (error) {

    }
  }


  render() {
    return (
      <KeyboardAvoidingView behavior="padding" enabled style={css.container}>
        <View style={css.logoContainer}>
          <Image
            resizeMode='contain'
            style={css.logo}
            source={require('../../assets/images/logo/futa-logo.png')}
          />
        </View>
        <View style={css.formContainer}>
          <Form>
            <Item inlineLabel style={{marginLeft: 0 }}>
              <Label style={{fontSize: 15, color: '#333'}}>Tên đăng nhập</Label>
              <Input
                autoCapitalize="none"
                value={this.state.username}
                onChangeText={(username) => this.setState({username})}/>
            </Item>
            <Item inlineLabel style={{marginLeft: 0 }}>
              <Label style={{fontSize: 15, color: '#333'}}>Mật khẩu</Label>
              <Input
                autoCapitalize="none"
                secureTextEntry
                onChangeText={(password) => this.setState({password})}/>
            </Item>
          </Form>
          <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center',alignItems: 'center', marginTop:  25 }}>
            <Button
              style={{ flex: 1 }}
              disabled={ this.state.loadingLogin }
              onPress={ () => this.login() }
              block>
                <MaterialCommunityIcons name='check-circle-outline' size={25} color='#fff' />
                <Text>Đăng nhập</Text>
                { this.state.loadingLogin && <Spinner color='white' size='small' /> }
            </Button>
          </View>
          <View style={{ position: 'absolute', bottom: 10, width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: 20, paddingBottom: 10 }}>
            <Text style={{ fontSize: 12 }}>Futa © 2001-2019 All Rights Reserved </Text>
          </View>
        </View>
        <Modal
          animationType="slide"
          transparent={true}
          visible={this.state.modalVisible}
          onRequestClose={() => {}}>
          <View style={{ backgroundColor: '#fff', flex: 1, paddingTop: Platform.OS === 'ios' ? (isIphoneXorAbove() ? 44 : 20) : 0 }}>
            <View style={{ height: 50 }}>
              <TouchableOpacity
                onPress={ () => this.setState({
                  modalVisible: false
                })}>
                <View style={{ minWidth: 75, height: 50, paddingLeft: 15, justifyContent: 'center', display: 'flex' }}>
                  <MaterialIcons name='close' size={26} color='#535c68' />
                </View>
              </TouchableOpacity>
            </View>
            <View  style={{ padding: 15 }}>
              <Text style={{ fontSize: 28, paddingBottom: 18 }}>Bạn đang làm việc tại:</Text>
              {
                this.state.loadingSelectDepartment &&
                <Spinner color='#22409A' size='small' style={{ paddingTop: 10 }} />
              }
              {
                ! this.state.loadingSelectDepartment && this.state.listWorkDepartment.map((item) => {
                  return (
                    <TouchableOpacity onPress={ () => this.selectWorkDepartmantAndLogin(item.department_id) }
                      style={{ paddingTop: 25, paddingBottom: 25, borderColor: '#f1f1f1', borderBottomWidth: 1 }}
                      key={item.id}>
                      <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                        <MaterialIcons name='location-on' size={25} color='#4a4a4a' />
                        <Text>{ item.name }</Text>
                      </View>
                    </TouchableOpacity>
                  )
                })
              }
            </View>
          </View>
        </Modal>
      </KeyboardAvoidingView>
    );
  }
}

const css = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#00a8ff',
    backgroundColor: '#fff',
    padding: 10
  },
  logoContainer: {
    alignItems: 'center',
    flexGrow: 10,
    justifyContent: 'center'
  },
  formContainer: {
    flexGrow: 5,
    paddingLeft: 5,
    paddingRight: 5
  },
  logo: {
    height: 70
  },
  title: {
    color: '#fff',
    marginTop: 25,
    fontSize: 18
  }
});

export default SignInScreen;
