import React, { Component } from 'react';

import { StyleSheet, Alert, Image, KeyboardAvoidingView, View, AsyncStorage, Keyboard } from 'react-native';
import { Button, Text, Icon, Form, Item, Label, Input, Picker, Spinner } from 'native-base';

import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';

import axios from "../../axios"
import { findIndex } from 'lodash'

class SignInScreen extends Component {

  constructor(props) {
    super(props);
    this.state = {
      loadingLogin: false,
      loadingSelectDepartment: false,
      disabledLogin: false,
      disableSelectDepartment: true,
      username: '12400',
      password: '123456',
      department_id: '',
      listWorkDepartment: [

      ]
    };
  }

  componentDidMount() {

  }

  onValueChange2(value: string) {
      this.setState({
        department_id: value
      });
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

      this.setState({
        ...this.state, loadingLogin: false
      });

      if (responseJson.error) {
        if (responseJson.error_description) {
          Alert.alert(
            'Thất bại',
            responseJson.error_description
          );
        } else {
          Alert.alert(
            'Thất bại',
            'Có lỗi xảy ra. Vui lòng liên hệ admin !'
          );
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
        disabledLogin: true,
        disableSelectDepartment: true,
        loadingSelectDepartment: true
      }
    });
    axios.get('account_get_list_work_department').then(response => {
      if (response.Status == 1) {
        this.setState({
          ...this.state, ...{
            disabledLogin: true,
            disableSelectDepartment: false,
            loadingSelectDepartment: false,
            listWorkDepartment: response.Data
          }
        });
      } else {
        alert('Có lỗi xảy ra. Vui lòng liên hệ admin')
      }
    })
  }

  selectWorkDepartmantAndLogin () {
    if (this.state.department_id === '') {
      Alert.alert(
        'Thông báo',
        'Vui lòng chọn chi nhánh làm việc'
      );
      return false;
    }
    let department_id = this.state.department_id
    let index = findIndex(this.state.listWorkDepartment, function (o) {
      return o.id === department_id
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
            <Item inlineLabel>
              <Label style={{fontSize: 15, color: '#333'}}>Tên đăng nhập</Label>
              <Input
                autoCapitalize="none"
                value={this.state.username}
                onChangeText={(username) => this.setState({username})}/>
            </Item>
            <Item inlineLabel>
              <Label style={{fontSize: 15, color: '#333'}}>Mật khẩu</Label>
              <Input
                autoCapitalize="none"
                secureTextEntry
                onChangeText={(password) => this.setState({password})}/>
            </Item>
            {
              ! this.state.disableSelectDepartment &&
              <Item picker style={{ marginTop: 10, marginLeft: 5 }}>
                  <Picker
                    mode="dropdown"
                    iosIcon={<Icon name="arrow-down" />}
                    style={{ width: undefined }}
                    placeholder="Select your SIM"
                    placeholderStyle={{ color: "#bfc6ea" }}
                    placeholderIconColor="#007aff"
                    selectedValue={ this.state.department_id }
                    onValueChange={ this.onValueChange2.bind(this) }
                  >

                    <Picker.Item label="Chi nhánh làm việc" value="" />
                    {
                      this.state.listWorkDepartment.map((item) => {
                        return (
                          <Picker.Item key={item.id} label={item.name} value={item.id} />
                        )
                      })
                    }
                  </Picker>
              </Item>
            }
          </Form>
          <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center',alignItems: 'center', marginTop:  25 }}>
            <Button
              onPress={ () => this.selectWorkDepartmantAndLogin() }
              style={{ flex: 1, justifyContent: 'center',alignItems: 'center', marginRight: 10 }}
              disabled={ this.state.disableSelectDepartment }
              block>
                <MaterialIcons name='location-on' size={25} color='#fff' />
                <Text>Chọn</Text>
                { this.state.loadingSelectDepartment && <Spinner color='white' size='small' /> }
            </Button>
            <Button
              style={{ flex: 1}}
              disabled={ this.state.loadingLogin || this.state.disabledLogin }
              onPress={ () => this.login() }
              block>
                <MaterialCommunityIcons name='check-circle-outline' size={25} color='#fff' />
                <Text>Đăng nhập</Text>
                { this.state.loadingLogin && <Spinner color='white' size='small' /> }
            </Button>
          </View>
        </View>
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
    flexGrow: 5
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
