const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/");
    },
    filename: (req, file, cb) => {
        // Preserve original extension while ensuring unique filename
        const extension = path.extname(file.originalname);
        const basename = path.basename(file.originalname, extension);
        cb(null, `${basename}-${Date.now()}${extension}`);
    },
});

const fileFilter = (req, file, cb) => {
    // Comprehensive list of static image MIME types
    const allowedMimeTypes = [
        // Common web formats
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/webp",
        
        // Raw formats
        "image/raw",
        "image/x-raw",
        "image/arw",  // Sony
        "image/cr2",  // Canon
        "image/nef",  // Nikon
        "image/orf",  // Olympus
        
        // Vector formats
        "image/svg+xml",
        "image/x-adobe-dng",
        
        // Professional formats
        "image/tiff",
        "image/bmp",
        
        // High efficiency formats
        "image/heic",
        "image/heif",
        
        // Other common formats
        "image/x-icon",
        "image/vnd.microsoft.icon",
        "image/jp2",
        "image/jxr"
    ];

    // Function to check if file is animated GIF
    const isAnimatedGif = (file) => {
        return file.mimetype === "image/gif";
    };

    if (allowedMimeTypes.includes(file.mimetype) && !isAnimatedGif(file)) {
        cb(null, true);
    } else if (isAnimatedGif(file)) {
        cb(new Error("Animated GIFs are not allowed!"), false);
    } else {
        cb(new Error("Invalid file type. Only static image files are allowed!"), false);
    }
};

// Configuration object for multer
const multerConfig = {
    storage,
    fileFilter,
    limits: {
        fileSize: 3 * 1024 * 1024, // 10MB max file size
        files: 1 // Maximum number of files per upload
    }
};

// Create and export the multer middleware
const upload = multer(multerConfig);

module.exports = upload;