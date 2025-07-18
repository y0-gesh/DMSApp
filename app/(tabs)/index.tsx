
import { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  ActivityIndicator,
  RefreshControl,
  Image
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import axios from 'axios';
import { useAuth } from '@/contexts/AuthContext';

type Document = {
  id: string;
  title: string;
  date: string;
  tags: string[];
  type: string;
};

export default function Index() {
  const { token } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [recentDocuments, setRecentDocuments] = useState<Document[]>([]);
  
  const fetchRecentDocuments = async () => {
    try {
      setLoading(true);
      // This is a placeholder for the actual API call
      const response = await axios.post(
        'https://apis.allsoft.co/api/documentManagement/searchDocumentEntry',
        {
          major_head: '',
          minor_head: '',
          from_date: '',
          to_date: '',
          tags: [],
          uploaded_by: '',
          start: 0,
          length: 5, // Limit to 5 recent documents
          search: {
            value: ''
          }
        },
        {
          headers: { token }
        }
      );
      
      // Transform the response to match our Document type
      // This will need to be adjusted based on the actual API response structure
      const formattedResults = response.data.data.map((item: any) => ({
        id: item.id || item._id,
        title: item.document_name || 'Untitled Document',
        date: item.document_date || new Date().toISOString(),
        tags: item.tags?.map((tag: any) => tag.tag_name) || [],
        type: item.document_type || 'pdf',
      }));
      
      setRecentDocuments(formattedResults);
    } catch (error) {
      console.error('Fetch error:', error);
      // Show placeholder data for now
      setRecentDocuments([
        {
          id: '1',
          title: 'Sample Document 1',
          date: new Date().toISOString(),
          tags: ['Sample', 'Document'],
          type: 'pdf',
        },
        {
          id: '2',
          title: 'Sample Document 2',
          date: new Date().toISOString(),
          tags: ['Sample', 'Document'],
          type: 'image',
        },
      ]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };
  
  useEffect(() => {
    fetchRecentDocuments();
  }, []);
  
  const onRefresh = () => {
    setRefreshing(true);
    fetchRecentDocuments();
  };
  
  const navigateToSearch = () => {
    router.push('/search');
  };
  
  const navigateToUpload = () => {
    router.push('/save');
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Document Management</Text>
      </View>

      <ScrollView 
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeTitle}>Welcome to DMS</Text>
          <Text style={styles.welcomeSubtitle}>Manage your documents efficiently</Text>
        </View>

        <View style={styles.quickActionsSection}>
          <TouchableOpacity 
            style={styles.actionCard}
            onPress={navigateToSearch}
          >
            <View style={[styles.actionIcon, styles.searchIcon]}>
              <Text style={styles.actionIconText}>🔍</Text>
            </View>
            <Text style={styles.actionTitle}>Search</Text>
            <Text style={styles.actionSubtitle}>Find documents</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionCard}
            onPress={navigateToUpload}
          >
            <View style={[styles.actionIcon, styles.uploadIcon]}>
              <Text style={styles.actionIconText}>📤</Text>
            </View>
            <Text style={styles.actionTitle}>Upload</Text>
            <Text style={styles.actionSubtitle}>Add new document</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.recentSection}>
          <Text style={styles.sectionTitle}>Recent Documents</Text>
          
          {loading ? (
            <ActivityIndicator size="large" color="#0a7ea4" style={styles.loader} />
          ) : recentDocuments.length > 0 ? (
            recentDocuments.map((doc) => (
              <TouchableOpacity key={doc.id} style={styles.documentCard}>
                <View style={styles.documentIconContainer}>
                  <Text style={styles.documentIcon}>
                    {doc.type === 'pdf' ? '📄' : '🖼️'}
                  </Text>
                </View>
                <View style={styles.documentInfo}>
                  <Text style={styles.documentTitle} numberOfLines={1}>
                    {doc.title}
                  </Text>
                  <Text style={styles.documentDate}>
                    {new Date(doc.date).toLocaleDateString()}
                  </Text>
                  <View style={styles.tagsContainer}>
                    {doc.tags.slice(0, 2).map((tag, index) => (
                      <View key={index} style={styles.tag}>
                        <Text style={styles.tagText}>{tag}</Text>
                      </View>
                    ))}
                    {doc.tags.length > 2 && (
                      <Text style={styles.moreTagsText}>+{doc.tags.length - 2}</Text>
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No recent documents found</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
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
  welcomeSection: {
    backgroundColor: '#0a7ea4',
    padding: 20,
    marginBottom: 20,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  quickActionsSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  actionCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    width: '48%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  searchIcon: {
    backgroundColor: '#e1f5fe',
  },
  uploadIcon: {
    backgroundColor: '#e8f5e9',
  },
  actionIconText: {
    fontSize: 24,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  actionSubtitle: {
    fontSize: 12,
    color: '#666',
  },
  recentSection: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  loader: {
    marginTop: 20,
  },
  documentCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  documentIconContainer: {
    marginRight: 15,
  },
  documentIcon: {
    fontSize: 30,
  },
  documentInfo: {
    flex: 1,
  },
  documentTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  documentDate: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tag: {
    backgroundColor: '#e1f5fe',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginRight: 5,
  },
  tagText: {
    fontSize: 12,
    color: '#0288d1',
  },
  moreTagsText: {
    fontSize: 12,
    color: '#666',
    alignSelf: 'center',
  },
  emptyContainer: {
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
})
