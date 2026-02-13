import { Module } from '@/types';

export const modules: Module[] = [
  {
    id: 'cloud-fundamentals',
    title: 'Cloud Fundamentals',
    description: 'Core cloud concepts, service models, and deployment strategies',
    icon: 'Cloud',
    questionCount: 30,
  },
  {
    id: 'aws',
    title: 'AWS',
    description: 'Amazon Web Services - EC2, S3, Lambda, VPC, IAM, and more',
    icon: 'Server',
    questionCount: 45,
  },
  {
    id: 'azure',
    title: 'Azure',
    description: 'Microsoft Azure - VMs, Storage, Functions, and enterprise services',
    icon: 'Database',
    questionCount: 35,
  },
  {
    id: 'linux',
    title: 'Linux',
    description: 'Linux administration, shell scripting, and system management',
    icon: 'Terminal',
    questionCount: 40,
  },
  {
    id: 'networking',
    title: 'Networking',
    description: 'TCP/IP, DNS, load balancing, firewalls, and network security',
    icon: 'Network',
    questionCount: 35,
  },
  {
    id: 'docker',
    title: 'Docker',
    description: 'Containerization, images, volumes, networking, and Docker Compose',
    icon: 'Box',
    questionCount: 40,
  },
  {
    id: 'kubernetes',
    title: 'Kubernetes',
    description: 'Container orchestration, pods, services, deployments, and Helm',
    icon: 'Layers',
    questionCount: 45,
  },
  {
    id: 'terraform',
    title: 'Terraform',
    description: 'Infrastructure as Code, providers, modules, and state management',
    icon: 'Code',
    questionCount: 30,
  },
  {
    id: 'monitoring',
    title: 'Monitoring & Logging',
    description: 'Prometheus, Grafana, ELK stack, and observability practices',
    icon: 'Activity',
    questionCount: 30,
  },
  {
    id: 'security',
    title: 'Security & DevSecOps',
    description: 'Security practices, vulnerability scanning, secrets management',
    icon: 'Shield',
    questionCount: 35,
  },
];
