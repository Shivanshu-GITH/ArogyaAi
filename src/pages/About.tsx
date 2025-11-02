import React from 'react';
import { Users, Trophy, Target, Heart, Code, Brain, Database, Phone, Mail, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';
import { useLanguage } from '../contexts/LanguageContext';
import { getTranslation } from '../utils/translations';

const About = () => {
  const { language } = useLanguage();

  const projectHighlights = [
    {
      icon: Target,
      titleKey: "about.project.focus",
      descKey: "about.project.focusDesc",
      details: "ArogyaAI"
    },
    {
      icon: Heart,
      titleKey: "about.project.mission",
      descKey: "about.project.missionDesc",
      details: "Digital Health for All"
    }
  ];

  const technologies = [
    "about.tech.react", "about.tech.typescript", "about.tech.node", "about.tech.tensorflow", 
    "about.tech.nlp", "about.tech.whatsapp", "about.tech.sms", 
    "about.tech.govt", "about.tech.mongodb", "about.tech.express", "about.tech.tailwind"
  ];

  const teamLeadSkills = [
    "about.team.lead.skill.react", "about.team.lead.skill.node", "about.team.lead.skill.aiml", "about.team.lead.skill.system", "about.team.lead.skill.health"
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 via-purple-600 to-green-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <Heart className="h-16 w-16 mx-auto mb-6 text-red-300" />
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                {getTranslation(language, 'about.title')}
              </h1>
              <p className="text-xl md:text-2xl mb-8 text-blue-100 max-w-3xl mx-auto">
                {getTranslation(language, 'about.subtitle')}
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Project Info */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4 text-center">
              {getTranslation(language, 'about.project.title')}
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-center">
              {getTranslation(language, 'about.project.subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto justify-items-center">
            {projectHighlights.map((highlight, index) => (
              <motion.div
                key={highlight.titleKey}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white rounded-2xl p-8 shadow-lg text-center w-full max-w-sm"
              >
                <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <highlight.icon className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {getTranslation(language, highlight.titleKey)}
                </h3>
                <p className="text-gray-600 mb-4">
                  {getTranslation(language, highlight.descKey)}
                </p>
                <span className="inline-block bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm font-medium">
                  {highlight.details}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              {getTranslation(language, 'about.team.title')}
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              {getTranslation(language, 'about.team.subtitle')}
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 justify-items-center max-w-4xl mx-auto">
          <div className="lg:col-span-4 flex justify-center mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="bg-gradient-to-r from-blue-50 to-green-50 rounded-2xl p-8 text-center max-w-md hover:shadow-lg transition-shadow"
            >
              <div className="bg-white w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4 shadow-md">
                <Code className="h-12 w-12 text-blue-600" />
              </div>
              
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {getTranslation(language, 'about.team.lead.name')}
              </h3>
              
              <p className="text-blue-600 font-medium mb-3">
                {getTranslation(language, 'about.team.lead.role')}
              </p>
              
              <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                {getTranslation(language, 'about.team.lead.desc')}
              </p>

              <div className="flex flex-wrap gap-1 justify-center mb-4">
                {teamLeadSkills.map((skill, skillIndex) => (
                  <span
                    key={skillIndex}
                    className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded"
                  >
                    {getTranslation(language, skill)}
                  </span>
                ))}
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-center space-x-2">
                  <Phone className="h-4 w-4 text-blue-600" />
                  <span className="text-gray-700">+91 8882183479</span>
                </div>
                <div className="flex items-center justify-center space-x-2">
                  <Mail className="h-4 w-4 text-blue-600" />
                  <span className="text-gray-700">startupstx@gmail.com</span>
                </div>
                <div className="flex items-center justify-center space-x-2">
                  <ExternalLink className="h-4 w-4 text-blue-600" />
                  <a href="https://github.com/Shivanshu-GITH" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700">
                    {getTranslation(language, 'about.team.lead.contact.github')}: Shivanshu-GITH
                  </a>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Technologies */}
      <section className="py-16 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">
              {getTranslation(language, 'about.tech.title')}
            </h2>
            <p className="text-gray-300 max-w-2xl mx-auto">
              {getTranslation(language, 'about.tech.subtitle')}
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-4">
            {technologies.map((tech, index) => (
              <motion.span
                key={tech}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                viewport={{ once: true }}
                className="bg-gray-800 border border-gray-700 rounded-full px-6 py-3 text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
              >
                {getTranslation(language, tech)}
              </motion.span>
            ))}
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="bg-blue-50 rounded-2xl p-8"
            >
              <div className="flex items-center mb-6">
                <div className="bg-blue-600 p-3 rounded-lg mr-4">
                  <Target className="h-8 w-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">{getTranslation(language, 'about.mission.title')}</h2>
              </div>
              <p className="text-gray-700 text-lg leading-relaxed">
                {getTranslation(language, 'about.mission.desc')}
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="bg-green-50 rounded-2xl p-8"
            >
              <div className="flex items-center mb-6">
                <div className="bg-green-600 p-3 rounded-lg mr-4">
                  <Heart className="h-8 w-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">{getTranslation(language, 'about.vision.title')}</h2>
              </div>
              <p className="text-gray-700 text-lg leading-relaxed">
                {getTranslation(language, 'about.vision.desc')}
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Impact Goals */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-green-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold mb-6">
              {getTranslation(language, 'about.impact.title')}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
              <div>
                <div className="text-4xl font-bold mb-2">10M+</div>
                <p className="text-blue-100">{getTranslation(language, 'about.impact.people')}</p>
              </div>
              <div>
                <div className="text-4xl font-bold mb-2">8+</div>
                <p className="text-blue-100">{getTranslation(language, 'about.impact.languages')}</p>
              </div>
              <div>
                <div className="text-4xl font-bold mb-2">24/7</div>
                <p className="text-blue-100">{getTranslation(language, 'about.impact.availability')}</p>
              </div>
            </div>
            
            <div className="mt-12 bg-white/10 rounded-2xl p-6">
              <p className="text-lg leading-relaxed">
                {getTranslation(language, 'about.impact.quote')}
              </p>
              <p className="mt-4 font-semibold">{getTranslation(language, 'about.impact.team')}</p>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default About;