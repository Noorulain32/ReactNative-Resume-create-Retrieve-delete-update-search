import React, { useState, useEffect } from 'react';
import { View, SectionList, StyleSheet, Pressable, TextInput, Button, Text, Modal } from 'react-native';
import { firebase } from '../config';

const Fetch = () => {
  const [resumes, setResumes] = useState([]);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [contact, setContact] = useState('');
  const [address, setAddress] = useState('');
  const [skills, setSkills] = useState('');
  const [qualification, setQualification] = useState('');
  const [searchText, setSearchText] = useState('');
  const [updatedName, setUpdatedName] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);

  useEffect(() => {
    const resumeRef = firebase.firestore().collection('resumes');
    const unsubscribe = resumeRef.onSnapshot((querySnapshot) => {
      const data = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setResumes(data);
    });

    return () => unsubscribe();
  }, []);

  const handleAddResume = () => {
    const resumeRef = firebase.firestore().collection('resumes');
    resumeRef
      .add({
        name: name,
        email: email,
        contact: contact,
        address: address,
        skills: skills,
        qualification: qualification,
      })
      .then(() => {
        setName('');
        setEmail('');
        setContact('');
        setAddress('');
        setSkills('');
        setQualification('');
        console.log('Resume added successfully!');
      })
      .catch((error) => {
        console.log('Error adding resume: ', error);
      });
  };

  const handleDeleteResume = (id) => {
    const resumeRef = firebase.firestore().collection('resumes').doc(id);
    resumeRef
      .delete()
      .then(() => {
        console.log('Resume deleted successfully!');
      })
      .catch((error) => {
        console.log('Error deleting resume: ', error);
      });
  };

  const handleUpdateResume = (id, updatedFields) => {
    const resumeRef = firebase.firestore().collection('resumes').doc(id);
    resumeRef
      .update(updatedFields)
      .then(() => {
        console.log('Resume updated successfully!');
        setUpdatedName(''); // Reset the updated name after successful update
        setIsModalVisible(false); // Close the modal
      })
      .catch((error) => {
        console.log('Error updating resume: ', error);
      });
  };

  const handleSearch = () => {
    const resumeRef = firebase.firestore().collection('resumes');
    resumeRef
      .where('name', '>=', searchText)
      .where('name', '<=', searchText + '\uf8ff')
      .get()
      .then((querySnapshot) => {
        const data = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setResumes(data);
        console.log('Search successful!');
      })
      .catch((error) => {
        console.log('Error searching resumes: ', error);
      });
  };

  const openModal = () => {
    setIsModalVisible(true);
  };

  const closeModal = () => {
    setIsModalVisible(false);
  };

  const renderSectionHeader = ({ section }) => (
    <View style={styles.sectionHeaderContainer}>
      <Text style={styles.sectionHeaderText}>{section.title}</Text>
    </View>
  );

  const renderItem = ({ item }) => (
    <Pressable style={styles.itemContainer}>
      <View style={styles.innerContainer}>
        <Text style={styles.itemHeading}>Name: {item.name}</Text>
        <Text style={styles.itemText}>Email: {item.email}</Text>
        <Text style={styles.itemText}>Contact: {item.contact}</Text>
        <Text style={styles.itemText}>Address: {item.address}</Text>
        <Text style={styles.itemText}>Skills: {item.skills}</Text>
        <Text style={styles.itemText}>Qualification: {item.qualification}</Text>
        <View style={styles.buttonContainer}>
          <Button title="Delete" onPress={() => handleDeleteResume(item.id)} />
          <Button title="Update Name" onPress={openModal} />
        </View>
      </View>
      <Modal visible={isModalVisible} onRequestClose={closeModal}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalHeading}>Update Name</Text>
          <TextInput
            style={styles.textBoxes}
            placeholder="Enter updated name"
            value={updatedName}
            onChangeText={setUpdatedName}
          />
          <Button
            title="Update"
            onPress={() => {
              const updatedFields = {
                name: updatedName || item.name, // Use the updatedName if available, otherwise use the existing name
              };
              handleUpdateResume(item.id, updatedFields);
            }}
          />
          <Button title="Cancel" onPress={closeModal} />
        </View>
      </Modal>
    </Pressable>
  );

  return (
    <View style={styles.container}>
      <SectionList
        sections={[{ title: 'Resumes', data: resumes }]}
        keyExtractor={(item, index) => item + index}
        renderItem={renderItem}
        renderSectionHeader={renderSectionHeader}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        SectionSeparatorComponent={() => <View style={styles.separator} />}
      />
      <Text style={styles.sectionHeaderContainer}>Enter your Resume</Text>
      <TextInput
        style={styles.textBoxes}
        placeholder="Name"
        value={name}
        onChangeText={setName}
      />
      <TextInput
        style={styles.textBoxes}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.textBoxes}
        placeholder="Contact"
        value={contact}
        onChangeText={setContact}
      />
      <TextInput
        style={styles.textBoxes}
        placeholder="Address"
        value={address}
        onChangeText={setAddress}
      />
      <TextInput
        style={styles.textBoxes}
        placeholder="Skills"
        value={skills}
        onChangeText={setSkills}
      />
      <TextInput
        style={styles.textBoxes}
        placeholder="Qualification"
        value={qualification}
        onChangeText={setQualification}
      />
      <Button title="Add Resume" onPress={handleAddResume} />
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search by Name"
          value={searchText}
          onChangeText={setSearchText}
        />
        <Button title="Search" onPress={handleSearch} />
      </View>
    </View>
  );
};

export default Fetch;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 30,
    backgroundColor: '#fff',
  },
  sectionHeaderContainer: {
    backgroundColor: 'lightgray',
    padding: 10,
    marginBottom: 10,
  },
  sectionHeaderText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  itemContainer: {
    backgroundColor: 'pink',
    padding: 15,
    borderRadius: 15,
    margin: 5,
    marginHorizontal: 10,
  },
  innerContainer: {
    alignItems: 'center',
    flexDirection: 'column',
  },
  itemHeading: {
    fontWeight: 'bold',
  },
  itemText: {
    fontWeight: '300',
  },
  separator: {
    height: 1,
    backgroundColor: 'gray',
  },
  textBoxes: {
    width: '90%',
    marginRight: 10,
    fontSize: 18,
    padding: 8,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 10,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchInput: {
    flex: 1,
    marginRight: 10,
    padding: 8,
    borderWidth: 1,
    borderRadius: 5,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalHeading: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
});
