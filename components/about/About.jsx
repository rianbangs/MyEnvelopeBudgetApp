import React from 'react';
import { View, Text, TouchableOpacity, Image, Linking } from 'react-native';
import { icons } from '../../constants/index.js';
import styles from '../../styles';

function About() {
  const handleLinkedInPress = () => {
    Linking.openURL('https://www.linkedin.com/in/joseph-rian-cirunay-70b0312b4');
  };

  return (
    <View style={styles.Aboutcontainer}>
      <Text style={styles.headerText}>You can reach me on the following platforms:</Text>
      <View style={styles.iconContainer}>
        <TouchableOpacity onPress={handleLinkedInPress}>
          <Image
            source={icons.linkedin}
            resizeMode="contain"
            
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default About;