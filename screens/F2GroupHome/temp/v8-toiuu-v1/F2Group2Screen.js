import React, { Component } from 'react';
import { StyleSheet, Text, View, Button, TouchableOpacity, ScrollView, TextInput, Modal, Alert, Dimensions , Keyboard, StatusBar, Platform, FlatList, SectionList} from 'react-native';

import { MaterialIcons, MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { Spinner } from 'native-base';

import DropdownAlert from 'react-native-dropdownalert';

import { isIphoneXorAbove } from "../../filters";

import axios from "../../axios"
import { connect } from 'react-redux';
import { findIndex, forEach, chain, groupBy, map, filter } from 'lodash'
import { Audio } from 'expo';
import Loader from '../Helper/Loader';

import { checkColor, checkTypePackage, playSoundSuccess, playSoundFail } from "../Helper/Funtions"

class SectionListItem extends Component {

  constructor(props) {
    super(props)
    this.state = {
      name: '',
      description: '',
      checked: false,
    }
  }

  // Initialize the states
  componentWillMount() {
      const { name, description, checked } = this.props
      this.setState({ name, description, checked })
  }

  componentWillReceiveProps(nextProps) {
          const { name, description, checked } = nextProps.item

          this.setState({ name, description, checked })
      }

  shouldComponentUpdate(nextProps, nextState) {


    const { checked } = nextState
    const { checked: oldChecked } = this.state

            return checked !== oldChecked;
      }

    render() {

        return (
          <TouchableOpacity onPress={ this.props.onPress }>
            <View style={{
                flex: 1,
                flexDirection: 'column',
                backgroundColor: 'rgb(98, 197, 184)'
            }}>
                <Text style={{
                    fontSize: 16,
                    fontWeight: 'bold',
                    color: 'rgb(173, 252, 250)',
                    marginLeft: 20,
                    marginRight: 10,

                }}>{this.props.item.name}
                </Text>
                {
                  this.props.item.checked ?
                    <MaterialCommunityIcons name='check-circle' size={ 22 } color='#000' style={{ marginRight: 5 }} />
                  :
                  <MaterialCommunityIcons name='checkbox-blank-circle-outline' size={ 22 } color='#000' style={{ marginRight: 5 }} />
                }
                <Text style={{
                    fontSize: 16,
                    marginLeft: 20,
                    marginRight: 10,
                    color: 'rgb(173, 252, 250)',
                }}>{this.props.item.description}
                </Text>
                <View style={{backgroundColor: 'rgb(77,120, 140)', height: 1, margin: 4, marginLeft: 20,marginRight: 10}}>
                </View>
            </View>
          </TouchableOpacity>
        );
    }
}

class SectionHeader extends Component {

    render() {
        return (
            <View style={{
                flex: 1,
                backgroundColor: 'rgb(77,120, 140)',
            }}>
                <Text style={{
                    fontSize: 16,
                    fontWeight: 'bold',
                    color: 'white',
                    margin: 20
                }}>{this.props.section.title}
                </Text>
            </View>
        );
    }
}

class F2Group2Screen extends Component {

  constructor(props) {
    super(props);
    this.isCancelled = false;
    this.state = {
      loading: false,
      refreshing: false,
      loadingModal: false,
      modalVisible: false,
      listPackage: [],
      countText: 0,
      scanBarcodeStatus: 1,
      showCancel: 0,
      showAction: 0
    };
    this.audioPlayer = new Audio.Sound();
    this.doWork = this.doWork.bind()
    this._onPressSectionList = this._onPressSectionList.bind()

    this.sectionListData = [];
    for (let i = 0; i < 60; i++) {
      let items = []
      for (let j = 0; j < 1000; j++) {
        items.push(
          {name: Math.floor(Math.random() * 55555555555555555555) + 1, description: Math.floor(Math.random() * 55555555555555555555) + 1, checked: false},
        )
      }
      this.sectionListData.push(
        {
          title: Math.floor(Math.random() * 99999999999999999) + 1,
          data: items
        }
      )
    }

    // this.sectionListData = [
    //     {
    //         data: [
    //             {
    //                 name: 'Django',
    //                 description: 'Django is a high-level Python Web framework'
    //                   ,checked:false
    //             },
    //             {
    //                 name: 'Express',
    //                 description: 'Express is a fast, unopinionated, flexible and minimalist web framework for Node.js'
    //                   ,checked: true
    //             },
    //             {
    //                 name: 'Ruby on Rails',
    //                 description: 'Rails (usually referred to as "Ruby on Rails") is a web framework written for the Ruby programming language.'
    //                   ,checked: true
    //             },
    //             {
    //                 name: 'ASP.NET',
    //                 description: 'ASP.NET is an open source web framework developed by Microsoft for building modern web applications and services.'
    //                   ,checked: true
    //             },
    //             {
    //                 name: 'Perl',
    //                 description: 'Mojolicious is a next generation web framework for the Perl programming language'
    //             }
    //         ],
    //         title: "Server side"
    //           ,checked: true
    //     },
    //     {
    //         data: [
    //             {
    //                 name: 'AngularJS',
    //                 description: 'An incredibly robust JavaScript framework for data-heavy sites'
    //                   ,checked: true
    //             },
    //             {
    //                 name: 'JQuery',
    //                 description: 'A fast, small, JS object library that streamlines how JavaScript behaves across different browsers'
    //                   ,checked: true
    //             },
    //             {
    //                 name: 'React',
    //                 description: 'for user interface design'
    //                   ,checked: true
    //             },

    //         ],
    //         title: "Client side"
    //           ,checked: true
    //     },
    //     {
    //         data: [
    //             {
    //                 name: 'TensorFlow',
    //                 description: 'An open-source software library for Machine Intelligence.'
    //                   ,checked: true
    //             },
    //             {
    //                 name: 'Wise.io',
    //                 description: "Wise.io also aims to democratise the use of artificial intelligence with 'machine learning as a service'"
    //                   ,checked: true
    //             },
    //             {
    //                 name: 'Neon',
    //                 description: "Neon is Nervana's open source, Python-based machine learning library"
    //                   ,checked: true
    //             },
    //         ],
    //         title: "Artificial Intelligence"
    //     },
    // ];
  }

  componentDidMount() {
    this.isCancelled = false;
    this.didFocusListener = this.props.navigation.addListener(
      'didFocus',
      () => {
      }
    );
    this.fetchLocalF2GetListPackageToGroup(true);
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
    axios.post('local_f2_get_list_package_to_group', data).then(response => {
      if (response.Status == 1) {

        if (!this.isCancelled) {
          // Gán thêm trường checked
          let listPackageTemp = response.Data

          listPackageTemp.map(function(item) {
            item.checked = 0;
            item.color_app = checkColor(item.color);
            item.type_package_app = checkTypePackage(item.barcode);
            item.hide = 0;
            return item;
          })

          // Xóa bớt package
          listPackageTemp = listPackageTemp.filter(function(val) { return val.type_package_app == 1; });

          // Group By
          listPackageTemp = chain(listPackageTemp).groupBy("department_to").map(function(v, i) {
            return {
              department_to: i,
              items: map(v)
            }
          }).value();
          listPackageTemp = []

          for (let i = 0; i < 300; i++) {
            let items = []
            for (let j = 0; j < 3; j++) {
              items.push(
                {id: Math.floor(Math.random() * 55555555555555555555) + 1, barcode: Math.floor(Math.random() * 55555555555555555555) + 1, product_name: 'Bưu Phẩm'},
              )
            }
            listPackageTemp.push(
              {
                department_to: Math.floor(Math.random() * 99999999999999999) + 1,
                items: items
              }
            )
          }

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

  selectPackage (indexGroupBy, index) {
    let item = this.state.listPackage[indexGroupBy].items[index];
    if (!item.checked) {
      if (this.checkSameToDepartment(item)) {
        let listPackageTemp = this.state.listPackage;
        listPackageTemp[indexGroupBy].items[index].checked = ! listPackageTemp[indexGroupBy].items[index].checked;
        this.setState({
          ...this.state, listPackage: listPackageTemp
        });
      } else {
        playSoundFail(this.audioPlayer)
      }
    } else {
      let listPackageTemp = this.state.listPackage;
      listPackageTemp[indexGroupBy].items[index].checked = ! listPackageTemp[indexGroupBy].items[index].checked;
      this.setState({
        ...this.state, listPackage: listPackageTemp
      });
    }
  }

  checkSameToDepartment (item) {
    let packageSlected = [];
    forEach(this.state.listPackage, (itemGroup) => {
      forEach(itemGroup.items, (item) => {
        if (item.checked && item.type_package_app === 1) {
          packageSlected.push(item.to_department_id)
        }
      })
    })
    if (packageSlected.length) {
      if (packageSlected.includes(item.to_department_id)) {
        return true;
      }
      return false
    }
    return true
  }


  // Phần Seach
  doWork (items) {
    let flag = false; // Toàn bộ hide = 1
    forEach(items, (item, index) => {
      // Có 1 cái hide = 0 thì
      if (!item.hide) {
        flag = true
      }

    })
    return flag ? true : false;
  }

  // Phần Seach
  doWork2 (items) {
    let flag = false; // Toàn bộ hide = 1
    forEach(items, (item, index) => {
      // Có 1 cái hide = 0 thì
      if (item.checked) {
        flag = true
      }

    })
    return flag ? true : false;
  }

  _onPressSectionList = (item, index) => () => {
    item.checked = !item.checked;
    this.setState({
      ...this.sectionListData, ...{
        sectionListData: this.sectionListData
      }
    });
  }


  render() {
    const DeviceWidth = Dimensions.get('window').width - 150
    return (
      <View style={styles.container}>
        <View style={{ height: 50, alignItems: 'center', justifyContent: 'space-between', display: 'flex', flexDirection: 'row' }}>
          <TouchableOpacity  onPress={ () => this.props.navigation.navigate('DashboradStack') } >
            <View style={{ height: 50, display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
              <View style={{ width: 40 }}>
                <MaterialIcons name='navigate-before' size={ 35 } color='#000' style={{ fontWeight: 'bold' }} />
              </View>
              <Text style={{ fontWeight: 'bold', fontSize: 18 }}>Nhóm F2 Section List</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity onPress={ () => this.openModal() }>
            <View style={{ minWidth: 75, height: 50, paddingRight: 10, justifyContent: 'center', display: 'flex' }}>
              {
                this.state.showAction == 1 &&
                <Text style={{ fontSize: 15, color: '#000', fontWeight: 'bold' }}>Xác nhận</Text>
              }
            </View>
          </TouchableOpacity>
        </View>
       <View style={{ flex: 1, backgroundColor: '#fff' }}>
          <View style={{ flex: 1, marginTop: Platform.OS === 'ios' ? 34 : 0 }}>
              <SectionList
                  renderItem={({ item, index }) => {
                      return (<SectionListItem onPress={this._onPressSectionList(item, index)} item={item} index={index} >

                      </SectionListItem>);
                  }}
                  renderSectionHeader={({ section }) => {
                      return (<SectionHeader section={section} />);
                  }}
                  sections={this.sectionListData}
                  keyExtractor={(item, index) => item.name}
              >

              </SectionList>
          </View>
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

export default connect(mapStateToProps, null)(F2Group2Screen);
