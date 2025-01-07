import { supabase } from "@/integrations/supabase/client";

export const uploadFile = async (file: File, questionId: number, fileIndex: number): Promise<string> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("User not authenticated");

  // Create path: user_id/question_id/file_index_filename
  const filePath = `${user.id}/${questionId}/${fileIndex}_${file.name}`;

  try {
    const { data, error } = await supabase.storage
      .from('question-files')
      .upload(filePath, file, {
        upsert: true,
        cacheControl: '3600'
      });

    if (error) {
      console.error("Supabase storage error:", error);
      throw new Error(`Failed to upload file: ${error.message}`);
    }

    if (!data?.path) {
      throw new Error("No file path returned from upload");
    }

    return filePath;
  } catch (error) {
    console.error("Error uploading file:", error);
    throw error;
  }
};


export const getFileUrl = async (filePath: string): Promise<string> => {
  const { data } = await supabase.storage
    .from('question-files')
    .createSignedUrl(filePath, 3600); // 1 hour expiry

  if (!data?.signedUrl) throw new Error("Failed to get file URL");
  
  return data.signedUrl;
};

export const deleteFile = async (filePath: string): Promise<void> => {
  const { error } = await supabase.storage
    .from('question-files')
    .remove([filePath]);

  if (error) throw error;
};