# --- Security Group ---

resource "aws_security_group" "backend" {
  name        = "${var.project_name}-backend-sg"
  description = "Allow SSH and API access"
  vpc_id      = data.aws_vpc.default.id

  ingress {
    description = "Backend API"
    from_port   = 3000
    to_port     = 3000
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${var.project_name}-backend-sg"
  }
}

# --- Key Pair (auto-generated if not provided) ---

resource "tls_private_key" "ec2" {
  count     = var.key_pair_name == "" ? 1 : 0
  algorithm = "RSA"
  rsa_bits  = 4096
}

resource "aws_key_pair" "generated" {
  count      = var.key_pair_name == "" ? 1 : 0
  key_name   = "${var.project_name}-key"
  public_key = tls_private_key.ec2[0].public_key_openssh
}

resource "local_file" "private_key" {
  count           = var.key_pair_name == "" ? 1 : 0
  content         = tls_private_key.ec2[0].private_key_pem
  filename        = "${path.module}/${var.project_name}-key.pem"
  file_permission = "0400"
}

# --- EC2 Instance ---

resource "aws_instance" "backend" {
  ami                    = data.aws_ami.amazon_linux.id
  instance_type          = var.ec2_instance_type
  key_name               = var.key_pair_name != "" ? var.key_pair_name : aws_key_pair.generated[0].key_name
  vpc_security_group_ids = [aws_security_group.backend.id]
  iam_instance_profile   = aws_iam_instance_profile.ec2_backend.name

  root_block_device {
    volume_size = 30
    volume_type = "gp3"
  }

  user_data = templatefile("${path.module}/user-data.sh", {
    db_name         = var.db_name
    db_user         = var.db_user
    db_password     = var.db_password
    ecr_backend_url = aws_ecr_repository.backend.repository_url
  })

  tags = {
    Name = "${var.project_name}-backend"
  }
}

# --- Elastic IP ---

resource "aws_eip" "backend" {
  instance = aws_instance.backend.id
  domain   = "vpc"

  tags = {
    Name = "${var.project_name}-backend-eip"
  }
}
