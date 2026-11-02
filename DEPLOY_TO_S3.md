# STAYSCAPE — Deployment Guide for Amazon S3 Static Website Hosting

This comprehensive guide details how to deploy STAYSCAPE to **Amazon Web Services (AWS) Simple Storage Service (S3)** using Static Website Hosting.

Because STAYSCAPE is built entirely with semantic HTML5, CSS3, vanilla JavaScript, and browser `localStorage`, it requires **no web application server, no Node.js runtime, no backend framework, and no database**. It can be served globally as a static website directly from an S3 bucket for pennies per month.

---

## Table of Contents

1. [Prerequisites](#1-prerequisites)
2. [Step 1: Create an S3 Bucket](#step-1-create-an-s3-bucket)
3. [Step 2: Enable Static Website Hosting](#step-2-enable-static-website-hosting)
4. [Step 3: Configure Bucket Policy for Public Read Access](#step-3-configure-bucket-policy-for-public-read-access)
5. [Step 4: Upload Project Files](#step-4-upload-project-files)
6. [Step 5: Verify Deployment via Website Endpoint](#step-5-verify-deployment-via-website-endpoint)
7. [HTTP vs. HTTPS (Optional CloudFront Setup)](#http-vs-https-optional-cloudfront-setup)
8. [Cleanup: Deleting Bucket to Avoid Charges](#cleanup-deleting-bucket-to-avoid-charges)

---

## 1. Prerequisites

- An active **AWS Account** ([Sign up at aws.amazon.com](https://aws.amazon.com)).
- Access to the **AWS Management Console** or the **AWS CLI**.
- The complete STAYSCAPE project directory on your local machine.

---

## Step 1: Create an S3 Bucket

1. Sign in to the **AWS Management Console** and open the **Amazon S3 console** at [https://console.aws.amazon.com/s3/](https://console.aws.amazon.com/s3/).
2. Click **Create bucket**.
3. Under **General configuration**:
   - **Bucket name:** Enter a globally unique name (e.g. `stayscape-demo-2026-yourname`).
   - **AWS Region:** Choose an AWS Region close to your audience (e.g., `ap-south-1` for Mumbai, or `us-east-1` for N. Virginia).
4. Under **Object Ownership**:
   - Keep the default: **ACLs disabled (recommended)**.
5. Under **Block Public Access settings for this bucket**:
   - **Uncheck** *Block all public access*.
   - Check the confirmation box: *"I acknowledge that the current settings might result in this bucket and the objects within becoming public."*
   > ⚠️ **Security Notice:** Making a bucket publicly readable is required for Amazon S3 static website hosting when not using an Origin Access Control (OAC) with CloudFront. Ensure you do NOT upload any private keys, AWS credentials, or sensitive documents to this bucket.
6. Under **Bucket Versioning** and **Default encryption**:
   - Leave as default (Amazon S3-managed keys SSE-S3).
7. Click **Create bucket**.

---

## Step 2: Enable Static Website Hosting

1. In the S3 console, click the name of your newly created bucket.
2. Select the **Properties** tab.
3. Scroll down to the bottom to the **Static website hosting** panel and click **Edit**.
4. Choose **Enable**.
5. Under **Hosting type**, choose **Host a static website**.
6. Under **Index document**, enter:
   ```text
   index.html
   ```
7. Under **Error document** (optional), enter:
   ```text
   index.html
   ```
   *(Or you can specify `about.html`)*.
8. Click **Save changes**.
9. Note down the **Bucket website endpoint** displayed at the bottom of the Static website hosting section (e.g., `http://stayscape-demo-2026.s3-website.ap-south-1.amazonaws.com`).

---

## Step 3: Configure Bucket Policy for Public Read Access

To allow anonymous visitors on the internet to read your HTML, CSS, JavaScript, and image files:

1. In your bucket page, click the **Permissions** tab.
2. Scroll to **Bucket policy** and click **Edit**.
3. Paste the following JSON policy into the editor. **Replace `YOUR-BUCKET-NAME` with your actual bucket name**:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObjectForSTAYSCAPE",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::YOUR-BUCKET-NAME/*"
    }
  ]
}
```

4. Click **Save changes**.

---

## Step 4: Upload Project Files

You can upload your files either via the **AWS Management Console** or the **AWS CLI**.

### Option A: Using the AWS Management Console (Drag & Drop)

1. In your bucket page, select the **Objects** tab.
2. Click **Upload**.
3. Drag and drop all files and folders from your local `STAYSCAPE` directory into the browser window:
   - Root HTML files: `index.html`, `search.html`, `hotel.html`, `checkout.html`, `confirmation.html`, `bookings.html`, `admin.html`, `about.html`, `README.md`, `CLAUDE.md`, `DEPLOY_TO_S3.md`.
   - The entire `assets/` folder (including `assets/css/`, `assets/js/`, and `assets/images/`).
4. Ensure the relative directory hierarchy is preserved:
   ```
   your-bucket/
   ├── index.html
   ├── search.html
   ├── hotel.html
   ├── checkout.html
   ├── confirmation.html
   ├── bookings.html
   ├── admin.html
   ├── about.html
   ├── README.md
   ├── CLAUDE.md
   ├── DEPLOY_TO_S3.md
   └── assets/
       ├── css/
       │   ├── styles.css
       │   └── responsive.css
       ├── js/
       │   ├── data.js
       │   ├── common.js
       │   ├── search.js
       │   ├── hotel.js
       │   ├── checkout.js
       │   ├── bookings.js
       │   └── admin.js
       └── images/
           ├── README.md
           └── *.jpg
   ```
5. Click **Upload** and wait for completion.

### Option B: Using the AWS CLI (Recommended for fast sync)

If you have the AWS CLI installed and configured:

```bash
# Navigate to your project folder
cd /path/to/STAYSCAPE

# Sync all files to your S3 bucket
aws s3 sync . s3://YOUR-BUCKET-NAME/ --exclude ".git/*" --exclude "files.zip"
```

---

## Step 5: Verify Deployment via Website Endpoint

1. Copy your **Bucket website endpoint** from the Properties tab (e.g. `http://YOUR-BUCKET-NAME.s3-website.ap-south-1.amazonaws.com`).
2. Open it in a new browser tab.
3. Verify that:
   - The Home page loads with fonts, images, and the hero search bar.
   - Searching redirects to `search.html` and displays filtered stays.
   - Clicking a hotel opens `hotel.html?id=...` with the live price calculator.
   - Checkout generates a valid reservation and redirects to `confirmation.html?id=...`.
   - `bookings.html` and `admin.html` display the simulated records.

---

## HTTP vs. HTTPS (Optional CloudFront Setup)

> 💡 **Important Architectural Note:**
> Amazon S3 static website endpoints **only serve traffic over plain HTTP**. They do not support custom SSL certificates or HTTPS directly.

If you need **HTTPS** or want to attach a custom domain (e.g., `stayscape.yourdomain.com`):
1. Create an **Amazon CloudFront Distribution**.
2. Set the Origin Domain to your S3 website endpoint.
3. Select **Redirect HTTP to HTTPS**.
4. (Optional) Attach an SSL Certificate generated through **AWS Certificate Manager (ACM)** in `us-east-1`.
5. CloudFront also provides edge caching across AWS edge locations worldwide.

---

## Cleanup: Deleting Bucket to Avoid Charges

When you wish to decommission or teardown the static deployment:
1. In the S3 Console, select your bucket.
2. Click **Empty** and type `permanently delete` to delete all uploaded objects.
3. After emptying, click **Delete**, confirm the bucket name, and confirm deletion.
4. This ensures no residual storage costs are incurred.

---

&copy; 2026 STAYSCAPE — Cloud-Native Hospitality Platform.
