# AWS OIDC Setup for GitHub Actions

This guide explains how to configure AWS to accept OIDC tokens from GitHub Actions, eliminating the need for static secrets.

## Overview

OIDC (OpenID Connect) allows GitHub Actions to authenticate with AWS using temporary tokens instead of long-lived access keys. This is more secure because:

- No static secrets to manage or rotate
- Credentials are scoped to specific repositories
- Temporary tokens expire automatically
- Full audit trail in CloudTrail

## Setup Steps

### Step 1: Create OIDC Identity Provider in AWS

```bash
# Create the OIDC provider for GitHub
aws iam create-open-id-connect-provider \
  --url "https://token.actions.githubusercontent.com" \
  --client-id-list "sts.amazonaws.com" \
  --thumbprint-list "6938fd4d98bab03faadb97b34396831e3780aea1"
```

### Step 2: Create IAM Role for GitHub Actions

Create a file `github-actions-role.json`:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Federated": "arn:aws:iam::YOUR_ACCOUNT_ID:oidc-provider/token.actions.githubusercontent.com"
      },
      "Action": "sts:AssumeRoleWithWebIdentity",
      "Condition": {
        "StringEquals": {
          "token.actions.githubusercontent.com:aud": "sts.amazonaws.com"
        },
        "StringLike": {
          "token.actions.githubusercontent.com:sub": "repo:YOUR_ORG/YOUR_REPO:ref:refs/heads/main"
        }
      }
    }
  ]
}
```

Create the role:

```bash
aws iam create-role \
  --role-name GitHubActionsRole \
  --assume-role-policy-document file://github-actions-role.json \
  --description "Role for GitHub Actions OIDC authentication"
```

### Step 3: Attach Policies to the Role

```bash
# Attach policies based on what your workflow needs
aws iam attach-role-policy \
  --role-name GitHubActionsRole \
  --policy-arn arn:aws:iam::aws:policy/AmazonS3FullAccess

aws iam attach-role-policy \
  --role-name GitHubActionsRole \
  --policy-arn arn:aws:iam::aws:policy/CloudFrontFullAccess

# Or create a custom policy for least privilege
```

### Step 4: Configure GitHub Repository Secrets

Add these secrets to your GitHub repository (Settings → Secrets → Actions):

| Secret | Description |
|--------|-------------|
| `AWS_ACCOUNT_ID` | Your AWS account ID (12 digits) |
| `S3_BUCKET_NAME` | S3 bucket for deployment |
| `CLOUDFRONT_DISTRIBUTION_ID` | CloudFront distribution ID |

**Note:** These are NOT sensitive credentials - they're just identifiers. The actual authentication happens via OIDC.

### Step 5: Configure GitHub Environment (Optional but Recommended)

1. Go to Settings → Environments
2. Create "production" environment
3. Add protection rules:
   - Required reviewers
   - Wait timer
   - Deployment branches (main only)

## Security Best Practices

### 1. Scope the Role to Specific Branches

```json
"Condition": {
  "StringLike": {
    "token.actions.githubusercontent.com:sub": "repo:YOUR_ORG/YOUR_REPO:ref:refs/heads/main"
  }
}
```

### 2. Use Environment Protection

```yaml
environment:
  name: production
  url: https://your-app.example.com
```

### 3. Limit Session Duration

```yaml
role-duration-seconds: 3600  # 1 hour
```

### 4. Use Least Privilege Policies

Create custom policies instead of using AWS managed policies:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:DeleteObject",
        "s3:ListBucket"
      ],
      "Resource": [
        "arn:aws:s3:::your-bucket",
        "arn:aws:s3:::your-bucket/*"
      ]
    },
    {
      "Effect": "Allow",
      "Action": [
        "cloudfront:CreateInvalidation"
      ],
      "Resource": "arn:aws:cloudfront::YOUR_ACCOUNT_ID:distribution/YOUR_DISTRIBUTION_ID"
    }
  ]
}
```

## Troubleshooting

### Error: "No OpenIDConnect provider found"

```bash
# Verify the OIDC provider exists
aws iam list-open-id-connect-providers
```

### Error: "Not authorized to perform sts:AssumeRoleWithWebIdentity"

Check the role's trust policy conditions match your repository:
- Correct organization/repo name
- Correct branch reference
- Correct audience

### Error: "The security token included in the request is invalid"

Ensure the thumbprint is correct:
```bash
# Get the current thumbprint
openssl s_client -connect token.actions.githubusercontent.com:443 -servername token.actions.githubusercontent.com 2>/dev/null | openssl x509 -fingerprint -noout
```

## CloudFormation Template

For automated setup, use this CloudFormation template:

```yaml
AWSTemplateFormatVersion: '2010-09-09'
Description: GitHub Actions OIDC Integration

Parameters:
  GitHubOrg:
    Type: String
    Description: GitHub organization or username
  GitHubRepo:
    Type: String
    Description: GitHub repository name
  GitHubBranch:
    Type: String
    Default: main
    Description: Branch to allow deployments from

Resources:
  GitHubOIDCProvider:
    Type: AWS::IAM::OIDCProvider
    Properties:
      Url: https://token.actions.githubusercontent.com
      ClientIdList:
        - sts.amazonaws.com
      ThumbprintList:
        - 6938fd4d98bab03faadb97b34396831e3780aea1

  GitHubActionsRole:
    Type: AWS::IAM::Role
    Properties:
      RoleName: GitHubActionsRole
      AssumeRolePolicyDocument:
        Version: '2012-10-17'
        Statement:
          - Effect: Allow
            Principal:
              Federated: !Sub 'arn:aws:iam::${AWS::AccountId}:oidc-provider/token.actions.githubusercontent.com'
            Action: sts:AssumeRoleWithWebIdentity
            Condition:
              StringEquals:
                'token.actions.githubusercontent.com:aud': sts.amazonaws.com
              StringLike:
                'token.actions.githubusercontent.com:sub': !Sub 'repo:${GitHubOrg}/${GitHubRepo}:ref:refs/heads/${GitHubBranch}'
      Policies:
        - PolicyName: GitHubActionsPolicy
          PolicyDocument:
            Version: '2012-10-17'
            Statement:
              - Effect: Allow
                Action:
                  - s3:PutObject
                  - s3:GetObject
                  - s3:DeleteObject
                  - s3:ListBucket
                Resource:
                  - !Sub 'arn:aws:s3:::*'
              - Effect: Allow
                Action:
                  - cloudfront:CreateInvalidation
                Resource: '*'

Outputs:
  RoleArn:
    Description: ARN of the GitHub Actions role
    Value: !GetAtt GitHubActionsRole.Arn
    Export:
      Name: GitHubActionsRoleArn
```

Deploy with:

```bash
aws cloudformation create-stack \
  --stack-name github-actions-oidc \
  --template-body file://cloudformation.yml \
  --parameters \
    ParameterKey=GitHubOrg,ParameterValue=YOUR_ORG \
    ParameterKey=GitHubRepo,ParameterValue=YOUR_REPO \
  --capabilities CAPABILITY_NAMED_IAM
```

## References

- [GitHub Docs: OIDC with AWS](https://docs.github.com/en/actions/deployment/security-hardening-your-deployments/about-security-hardening-with-openid-connect)
- [AWS Docs: OIDC Identity Providers](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles_providers_create_oidc.html)
- [aws-actions/configure-aws-credentials](https://github.com/aws-actions/configure-aws-credentials)
