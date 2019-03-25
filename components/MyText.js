import React from 'react';
import { Text } from 'react-native';

export class MyText extends React.Component {
  setFontType = type => {
    switch (type) {
      case 'bold':
        return 'roboto-bold'
      default:
        return 'roboto'
    }
  }
  render() {
    const font = this.setFontType(this.props.type ? this.props.type : 'normal')
    const style = [{fontFamily: font}, this.props.style || {}]

    return <Text style={style}>{this.props.children}</Text>;
  }
}
