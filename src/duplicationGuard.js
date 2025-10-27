import { createHash } from 'crypto';
import { supabase } from './supabaseClient.js';

export class DuplicationGuard {
  static generateHash(prompt, category = 'general') {
    // מוודאים שיש קטגוריה תקינה
    const normalizedCategory = category?.trim() || 'general';
    const normalizedPrompt = prompt?.trim() || '';
    
    // יוצרים hash משולב - prompt + category
    const contentToHash = `${normalizedCategory}:${normalizedPrompt}`;
    
    return createHash('sha256').update(contentToHash).digest('hex');
  }

  static async checkDuplicate(prompt, category = 'general') {
    try {
      const hash = this.generateHash(prompt, category);
      
      console.log(`🔍 Checking duplicate for category: "${category}", hash: ${hash.substring(0, 8)}...`);

      // בודקים במסד הנתונים
      const { data, error } = await supabase
        .from('videos')
        .select('id, created_at')
        .eq('hash', hash)
        .order('created_at', { ascending: false })
        .limit(1);

      if (error) {
        console.error('❌ Error checking duplicate:', error);
        return { isDuplicate: false, existingVideo: null };
      }

      const isDuplicate = data && data.length > 0;
      
      if (isDuplicate) {
        console.log(`🚫 Duplicate found! Video ID: ${data[0].id}`);
        return { 
          isDuplicate: true, 
          existingVideo: data[0],
          hash: hash
        };
      } else {
        console.log('✅ No duplicate found - proceeding with creation');
        return { 
          isDuplicate: false, 
          existingVideo: null,
          hash: hash 
        };
      }

    } catch (error) {
      console.error('❌ DuplicationGuard error:', error);
      return { isDuplicate: false, existingVideo: null };
    }
  }

  static async cleanOldHashes(daysToKeep = 30) {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

      console.log(`🧹 Cleaning hashes older than: ${cutoffDate.toISOString()}`);

      const { error } = await supabase
        .from('videos')
        .delete()
        .lt('created_at', cutoffDate.toISOString());

      if (error) {
        console.error('❌ Error cleaning old hashes:', error);
        return false;
      }

      console.log('✅ Old hashes cleaned successfully');
      return true;

    } catch (error) {
      console.error('❌ Cleanup error:', error);
      return false;
    }
  }
}
