import { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  Alert, 
  ActivityIndicator,
  Platform,
  KeyboardAvoidingView
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as DocumentPicker from 'react-native-document-picker';
import axios from 'axios';
import { useAuth } from '@/contexts/AuthContext';

type Tag = {
  tag_name: string;
};

type UploadFormData = {
  major_head: string;
  minor_head: string;
  document_date: string;
  document_remarks: string;
  tags: Tag[];
};

export default function SaveScreen() {
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<DocumentPicker.DocumentPickerResponse | null>(null);
  const [formData, setFormData] = useState<UploadFormData>({
    major_head: '',
    minor_head: '',
    document_date: new Date().toISOString().split('T')[0],
    document_remarks: '',
    tags: [],
  });
  const [tagInput, setTagInput] = useState('');

  const handlePickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/*'],
        copyToCacheDirectory: true,
      });
      
      if (result.canceled === false) {
        setSelectedFile(result.assets[0]);
      }
    } catch (err) {
      console.error('Error picking document:', err);
      Alert.alert('Error', 'Failed to pick document');
    }
  };

  const handleAddTag = () => {
    if (!tagInput.trim()) return;
    
    // Check if tag already exists
    if (formData.tags.some(tag => tag.tag_name.toLowerCase() === tagInput.trim().toLowerCase())) {
      Alert.alert('Duplicate Tag', 'This tag has already been added');
      return;
    }
    
    setFormData({
      ...formData,
      tags: [...formData.tags, { tag_name: tagInput.trim() }],
    });
    setTagInput('');
  };

  const handleRemoveTag = (index: number) => {
    const newTags = [...formData.tags];
    newTags.splice(index, 1);
    setFormData({ ...formData, tags: newTags });
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      Alert.alert('Error', 'Please select a file to upload');
      return;
    }
    
    if (!formData.major_head || !formData.minor_head) {
      Alert.alert('Error', 'Major head and Minor head are required');
      return;
    }
    
    try {
      setLoading(true);
      
      // Create form data for multipart upload
      const uploadData = new FormData();
      
      // Add file
      uploadData.append('file', {
        uri: selectedFile.uri,
        type: selectedFile.mimeType || 'application/octet-stream',
        name: selectedFile.name || 'document',
      } as any);
      
      // Add metadata
      uploadData.append('data', JSON.stringify({
        ...formData,
        user_id: 'user', // This would typically come from the auth context
      }));
      
      // Make API request
      const response = await axios.post(
        'https://apis.allsoft.co/api/documentManagement/saveDocumentEntry',
        uploadData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            'token': token,
          },
        }
      );
      
      if (response.data && response.status === 200) {
        Alert.alert('Success', 'Document uploaded successfully');
        // Reset form
        setSelectedFile(null);
        setFormData({
          major_head: '',
          minor_head: '',
          document_date: new Date().toISOString().split('T')[0],
          document_remarks: '',
          tags: [],
        });
      }
    } catch (error) {
      console.error('Upload error:', error);
      Alert.alert('Error', 'Failed to upload document. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <StatusBar style="dark" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Upload Document</Text>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <View style={styles.fileSection}>
          <Text style={styles.sectionTitle}>Select Document</Text>
          <TouchableOpacity 
            style={styles.filePicker} 
            onPress={handlePickDocument}
            disabled={loading}
          >
            <Text style={styles.filePickerText}>
              {selectedFile ? selectedFile.name : 'Tap to select a file'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Document Details</Text>
          
          <Text style={styles.inputLabel}>Major Head *</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., Company"
            value={formData.major_head}
            onChangeText={(text) => setFormData({ ...formData, major_head: text })}
            editable={!loading}
          />
          
          <Text style={styles.inputLabel}>Minor Head *</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., Work Order"
            value={formData.minor_head}
            onChangeText={(text) => setFormData({ ...formData, minor_head: text })}
            editable={!loading}
          />
          
          <Text style={styles.inputLabel}>Document Date</Text>
          <TextInput
            style={styles.input}
            placeholder="YYYY-MM-DD"
            value={formData.document_date}
            onChangeText={(text) => setFormData({ ...formData, document_date: text })}
            editable={!loading}
          />
          
          <Text style={styles.inputLabel}>Remarks</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Add any additional notes here"
            multiline
            numberOfLines={4}
            value={formData.document_remarks}
            onChangeText={(text) => setFormData({ ...formData, document_remarks: text })}
            editable={!loading}
          />
          
          <Text style={styles.inputLabel}>Tags</Text>
          <View style={styles.tagInputContainer}>
            <TextInput
              style={styles.tagInput}
              placeholder="Add tags"
              value={tagInput}
              onChangeText={setTagInput}
              onSubmitEditing={handleAddTag}
              editable={!loading}
            />
            <TouchableOpacity 
              style={styles.addTagButton} 
              onPress={handleAddTag}
              disabled={loading || !tagInput.trim()}
            >
              <Text style={styles.addTagButtonText}>Add</Text>
            </TouchableOpacity>
          </View>
          
          {formData.tags.length > 0 && (
            <View style={styles.tagsContainer}>
              {formData.tags.map((tag, index) => (
                <View key={index} style={styles.tag}>
                  <Text style={styles.tagText}>{tag.tag_name}</Text>
                  <TouchableOpacity 
                    onPress={() => handleRemoveTag(index)}
                    disabled={loading}
                  >
                    <Text style={styles.removeTagText}>×</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
        </View>

        <TouchableOpacity 
          style={[styles.uploadButton, loading && styles.uploadButtonDisabled]} 
          onPress={handleUpload}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.uploadButtonText}>Upload Document</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f9fc',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  fileSection: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  filePicker: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderStyle: 'dashed',
    borderRadius: 8,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f9f9f9',
  },
  filePickerText: {
    color: '#0a7ea4',
    fontSize: 16,
  },
  formSection: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  inputLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    backgroundColor: '#f9f9f9',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  tagInputContainer: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  tagInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#f9f9f9',
    marginRight: 10,
  },
  addTagButton: {
    backgroundColor: '#0a7ea4',
    paddingHorizontal: 15,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addTagButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 15,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e1f5fe',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    fontSize: 14,
    color: '#0288d1',
    marginRight: 5,
  },
  removeTagText: {
    fontSize: 16,
    color: '#0288d1',
    fontWeight: 'bold',
  },
  uploadButton: {
    backgroundColor: '#0a7ea4',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 30,
  },
  uploadButtonDisabled: {
    backgroundColor: '#7fb9ca',
  },
  uploadButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});