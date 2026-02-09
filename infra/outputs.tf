output "cloudfront_domain" {
  description = "CloudFront distribution domain name"
  value       = aws_cloudfront_distribution.main.domain_name
}

output "cloudfront_distribution_id" {
  description = "CloudFront distribution ID"
  value       = aws_cloudfront_distribution.main.id
}

output "frontend_url" {
  description = "Frontend URL"
  value       = "https://${var.frontend_subdomain}.${var.domain_name}"
}

output "api_url" {
  description = "API URL"
  value       = "https://${var.api_subdomain}.${var.domain_name}"
}

output "s3_bucket_name" {
  description = "S3 bucket name for frontend"
  value       = aws_s3_bucket.frontend.bucket
}

output "ec2_public_ip" {
  description = "EC2 public IP"
  value       = aws_eip.backend.public_ip
}

output "ec2_public_dns" {
  description = "EC2 public DNS"
  value       = aws_eip.backend.public_dns
}

output "github_actions_role_arn" {
  description = "IAM Role ARN for GitHub Actions OIDC"
  value       = aws_iam_role.github_actions.arn
}

output "deploy_bucket_name" {
  description = "S3 bucket name for deploy artifacts"
  value       = aws_s3_bucket.deploy.bucket
}

output "ec2_instance_id" {
  description = "EC2 instance ID for SSM commands"
  value       = aws_instance.backend.id
}

output "ssm_command" {
  description = "SSM command to connect to EC2"
  value       = "aws ssm start-session --target ${aws_instance.backend.id}"
}

output "deploy_frontend" {
  description = "Commands to deploy frontend"
  value       = <<-EOT
    cd frontend && npm run build
    aws s3 sync out/ s3://${aws_s3_bucket.frontend.bucket}/ --delete
    aws cloudfront create-invalidation --distribution-id ${aws_cloudfront_distribution.main.id} --paths '/*'
  EOT
}

output "deploy_backend" {
  description = "Commands to deploy backend via SSM"
  value       = <<-EOT
    tar -czf backend.tar.gz -C backend .
    aws s3 cp backend.tar.gz s3://${aws_s3_bucket.deploy.bucket}/backend.tar.gz
    aws ssm send-command \
      --instance-ids ${aws_instance.backend.id} \
      --document-name AWS-RunShellScript \
      --parameters 'commands=["aws s3 cp s3://${aws_s3_bucket.deploy.bucket}/backend.tar.gz /tmp/backend.tar.gz","rm -rf /opt/app/backend/*","tar -xzf /tmp/backend.tar.gz -C /opt/app/backend/","cd /opt/app && sudo docker compose up -d --build backend"]'
  EOT
}
