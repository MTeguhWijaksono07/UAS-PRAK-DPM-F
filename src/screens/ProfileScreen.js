// ProfileScreen.js
import React, { useContext, useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  Modal,
  Alert,
  ActivityIndicator
} from 'react-native';
import { Context as AuthContext } from '../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';

const ProfileScreen = ({ navigation }) => {
  const { state, signout } = useContext(AuthContext);
  const { user } = state;
  const [isModalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [userStats, setUserStats] = useState({
    totalPosts: 0,
    followers: 0,
    following: 0
  });

  useEffect(() => {
    if (navigation) {
      navigation.setOptions({
        title: 'Profile',
        headerTitleStyle: {
          fontSize: 20,
          fontWeight: 'bold',
          color: '#FFFFFF',
        },
        headerStyle: {
          backgroundColor: '#121212',
        },
        headerRight: () => (
          <TouchableOpacity 
            style={styles.headerButton}
            onPress={() => navigation.navigate('EditProfile')}
          >
            <Ionicons name="settings-outline" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        ),
      });
    }
    fetchUserStats();
  }, [navigation]);

  const fetchUserStats = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `http://192.168.1.10:5000/api/users/${user?._id}/stats`,
        {
          headers: {
            Authorization: `Bearer ${state.token}`,
          },
        }
      );
      setUserStats(response.data);
    } catch (error) {
      console.error('Error fetching user stats:', error);
      Alert.alert('Error', 'Failed to load user statistics');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signout();
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
    } catch (error) {
      console.error('Logout error:', error);
      Alert.alert('Error', 'Failed to logout. Please try again.');
    }
  };

  const StatCard = ({ title, value, icon }) => (
    <View style={styles.statCard}>
      <Ionicons name={icon} size={24} color="#1e90ff" />
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statTitle}>{title}</Text>
    </View>
  );

  const SettingItem = ({ icon, title, onPress, showBadge }) => (
    <TouchableOpacity style={styles.settingItem} onPress={onPress}>
      <View style={styles.settingIconContainer}>
        <Ionicons name={icon} size={24} color="#999" />
        {showBadge && <View style={styles.notificationBadge} />}
      </View>
      <Text style={styles.settingText}>{title}</Text>
      <Ionicons name="chevron-forward" size={24} color="#666" />
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1e90ff" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.profileInfo}>
          <View style={styles.profileImageContainer}>
            <Image
              source={user?.profileImage 
                ? { uri: user.profileImage }
                : require('../../assets/default-avatar.png')
              }
              style={styles.profileImage}
            />
            <TouchableOpacity style={styles.editImageButton}>
              <Ionicons name="camera" size={20} color="#FFF" />
            </TouchableOpacity>
          </View>
          <Text style={styles.username}>{user?.username || 'Username'}</Text>
          <Text style={styles.email}>{user?.email || 'email@example.com'}</Text>
          <Text style={styles.bio}>{user?.bio || 'No bio added yet'}</Text>
        </View>
      </View>

      <View style={styles.statsContainer}>
        <StatCard
          title="Posts"
          value={userStats.totalPosts}
          icon="images-outline"
        />
        <StatCard
          title="Followers"
          value={userStats.followers}
          icon="people-outline"
        />
        <StatCard
          title="Following"
          value={userStats.following}
          icon="person-add-outline"
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account Settings</Text>
        <SettingItem
          icon="person-outline"
          title="Edit Profile"
          onPress={() => navigation.navigate('EditProfile')}
        />
        <SettingItem
          icon="notifications-outline"
          title="Notifications"
          onPress={() => navigation.navigate('Notifications')}
          showBadge={true}
        />
        <SettingItem
          icon="lock-closed-outline"
          title="Privacy & Security"
          onPress={() => navigation.navigate('Privacy')}
        />
        <SettingItem
          icon="moon-outline"
          title="Dark Mode"
          onPress={() => navigation.navigate('Appearance')}
        />
        <SettingItem
          icon="help-circle-outline"
          title="Help & Support"
          onPress={() => navigation.navigate('Support')}
        />
      </View>

      <TouchableOpacity
        style={styles.logoutButton}
        onPress={() => setModalVisible(true)}
      >
        <Ionicons name="log-out-outline" size={20} color="#fff" />
        <Text style={styles.logoutButtonText}>Log Out</Text>
      </TouchableOpacity>

      <Modal
        transparent={true}
        visible={isModalVisible}
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Logout</Text>
            <Text style={styles.modalText}>Are you sure you want to logout?</Text>
            <View style={styles.modalButtonContainer}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.logoutModalButton]}
                onPress={handleLogout}
              >
                <Text style={styles.modalButtonText}>Logout</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#121212',
  },
  headerButton: {
    marginRight: 15,
  },
  header: {
    backgroundColor: '#1e1e1e',
    padding: 20,
    alignItems: 'center',
  },
  profileInfo: {
    alignItems: 'center',
  },
  profileImageContainer: {
    position: 'relative',
    marginBottom: 15,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: '#1e90ff',
  },
  editImageButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#1e90ff',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#121212',
  },
  username: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  email: {
    fontSize: 16,
    color: '#999',
    marginBottom: 10,
  },
  bio: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 20,
    backgroundColor: '#1e1e1e',
    marginTop: 10,
  },
  statCard: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 5,
  },
  statTitle: {
    fontSize: 14,
    color: '#999',
    marginTop: 5,
  },
  section: {
    padding: 20,
    backgroundColor: '#1e1e1e',
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#fff',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  settingIconContainer: {
    position: 'relative',
    width: 24,
    height: 24,
  },
  notificationBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ff4444',
  },
  settingText: {
    flex: 1,
    fontSize: 16,
    marginLeft: 15,
    color: '#fff',
  },
  logoutButton: {
    flexDirection: 'row',
    backgroundColor: '#ff4444',
    margin: 20,
    padding: 15,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: 300,
    backgroundColor: '#1e1e1e',
    padding: 20,
    borderRadius: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
    textAlign: 'center',
  },
  modalText: {
    fontSize: 16,
    color: '#999',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: '#333',
  },
  logoutModalButton: {
    backgroundColor: '#ff4444',
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ProfileScreen;