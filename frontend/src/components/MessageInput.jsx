import { useRef, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { Image, Send, X } from "lucide-react";
import toast from "react-hot-toast";

const MessageInput = () => {
  const [text, setText] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);
  const { sendMessage } = useChatStore();

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!text.trim() && !imagePreview) return;

    try {
      await sendMessage({
        text: text.trim(),
        image: imagePreview,
      });

      setText("");
      removeImage();
    } catch (error) {
      toast.error("Failed to send message");
      console.error(error);
    }
  };

  return (
    <div className="p-4 w-full border-t border-base-300 bg-base-100 backdrop-blur-xl">

      {/* IMAGE PREVIEW */}
      {imagePreview && (
        <div className="mb-3">
          <div className="relative inline-block">
            <img
              src={imagePreview}
              alt="Preview"
              className="w-24 h-24 object-cover rounded-xl shadow border border-base-300"
            />

            <button
              type="button"
              onClick={removeImage}
              className="
                absolute -top-2 -right-2 size-6 rounded-full bg-base-300 
                flex items-center justify-center
                hover:bg-base-200 transition
              "
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* INPUT */}
      <form onSubmit={handleSendMessage} className="flex items-center gap-3">

        {/* TEXT INPUT */}
        <div className="flex-1 flex items-center gap-2">
          <input
            type="text"
            placeholder="Type a message..."
            className="
              input input-bordered w-full rounded-xl 
              input-sm sm:input-md
              focus:outline-none focus:ring focus:ring-primary/20
            "
            value={text}
            onChange={(e) => setText(e.target.value)}
          />

          {/* Hidden file input */}
          <input
            type="file"
            accept="image/*"
            className="hidden"
            ref={fileInputRef}
            onChange={handleImageChange}
          />

          {/* IMAGE UPLOAD BUTTON */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="
              btn btn-circle btn-ghost hover:bg-primary/10 transition-all
            "
            title="Upload Image"
          >
            <Image className="w-5 h-5" />
          </button>
        </div>

        {/* SEND BUTTON */}
        <button
          type="submit"
          disabled={!text.trim() && !imagePreview}
          className="
            size-11 rounded-xl flex items-center justify-center
            transition-all active:scale-90
            text-white
            disabled:bg-base-300 disabled:text-base-content/40
            bg-primary hover:bg-primary/80
          "
          title="Send Message"
        >
          <Send className="w-5 h-5" />
        </button>
      </form>
    </div>
  );
};

export default MessageInput;
