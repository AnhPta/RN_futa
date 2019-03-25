import React, { Component } from 'react';
import { StyleSheet, Text, View, WebView, ActivityIndicator, Dimensions, Platform, StatusBar, Keyboard, TextInput,ScrollView } from 'react-native';

import { isIphoneX } from "../../filters";
import DropdownAlert from 'react-native-dropdownalert';

import { ListItem } from 'react-native-elements'

//REDUX
import { connect } from 'react-redux';

class SearchScreen extends Component {

  constructor(props) {
    super(props);
    this.renderRow = this.renderRow.bind(this);
    this.state = {
      refreshing: false,
      listBarcode: [

      ]
    };
  }

  componentDidMount () {
    this.ref.focus();
    // Keyboard.addListener('keyboardDidShow', () => Keyboard.dismiss());
  }

  changeText (text) {
    var joined = this.state.listBarcode.concat(text);
    this.setState({ listBarcode: joined })
    this.ref.clear()
    this.dropdown.alertWithType('success', 'Thành công', 'Barcode: ' +  text);
  }

  renderRow(item) {
    return (
      <View>
        <Tile>
          <Title styleName="md-gutter-bottom">{item}</Title>
        </Tile>
        <Divider styleName="line" />
      </View>
    );
  }

  render() {
    let { width, height } = Dimensions.get('window');
    return (
      <View style={styles.container}>
        <View>
          <TextInput
            ref={ref => (this.ref = ref)}
            onChangeText={(text) => this.changeText(text)}
            style={{height: 0, width: 200, borderColor: 'gray', borderWidth: 1}}
          />
        </View>
        <ScrollView style={{ width: '100%' }}>
          {
            this.state.listBarcode.length != 0 &&
            <Text
              style={{ marginBottom: 10, marginTop: 10, marginLeft: 20, fontSize: 15 }}>
              Danh sách hàng hóa:
            </Text>
          }
          {
            this.state.listBarcode.map((item, index) => {
              return (
                <ListItem
                  containerStyle={{ borderColor: '#EBEDF1', borderBottomWidth: 1 }}
                  key={index}
                  title={item}
                  leftIcon={{ name: 'filter-center-focus' }}
                />
              )
            })
          }
        </ScrollView>
        <DropdownAlert
          closeInterval={800}
          defaultContainer={{padding: 8, paddingTop: Platform.OS === 'ios' ? 0 : 20, flexDirection: 'row'}}
          ref={ref => this.dropdown = ref} />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#f2f2f2',
    paddingTop: Platform.OS === 'ios' ? (isIphoneX() ? 44 : 22) : StatusBar.currentHeight
  }
});

const mapStateToProps = state => ({
  cartState: state.cartState
});

export default connect(mapStateToProps, null)(SearchScreen);
